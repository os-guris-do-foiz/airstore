import { Request, Response } from 'express';
import { AppDataSource } from '../db/index';
import { Report } from '../domains/report';
import { User } from '../domains/user';
import { Comment } from '../domains/comment';
import { notify } from '../services/notificationService';
import { processAndStoreImages } from '../services/imageService';
import { parsePagination, buildPage } from '../utils/pagination';

const VALID_TYPES_FILTER = ['AD', 'FIELD', 'USER', 'REVIEW', 'SYSTEM'];
const VALID_STATUSES_FILTER = ['PENDING', 'RESOLVED', 'DISMISSED'];

const notifyAdmins = async (report: Report) => {
  const userRepo = AppDataSource.getRepository(User);
  const targets = await userRepo
    .createQueryBuilder('u')
    .where(':role = ANY(u.roles)', { role: 'ADMIN' })
    .getMany();

  const isBug = report.type === 'SYSTEM';
  const label = report.type === 'REVIEW' ? 'avaliação' : report.type;
  const message = isBug
    ? `🐞 Novo bug reportado: ${report.reason}`
    : `🚩 Nova denúncia (${label}): ${report.reason}`;

  for (const admin of targets) {
    await notify(admin.id, isBug ? 'REPORT_BUG' : 'REPORT', message, '/admin');
  }
};

export const createReport = async (req: any, res: Response) => {
  try {
    const { target_id, type, reason, description } = req.body;
    const reporter_id = req.user.id;

    if (!target_id || !type || !reason) {
      return res.status(400).json({ error: 'Campos obrigatórios: target_id, type e reason.' });
    }

    const VALID_TYPES = ['AD', 'FIELD', 'USER', 'REVIEW', 'SYSTEM'];
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Tipo de denúncia inválido.' });
    }

    const images = (req.files && req.files.length > 0)
      ? await processAndStoreImages(req.files.map((f: any) => f.buffer))
      : [];

    const reportRepo = AppDataSource.getRepository(Report);
    const newReport = reportRepo.create({
      reporter: { id: reporter_id },
      target_id,
      type,
      reason,
      description,
      images,
    });

    await reportRepo.save(newReport);
    await notifyAdmins(newReport);
    return res.status(201).json({ message: 'Denúncia enviada com sucesso.', report: newReport });
  } catch (error: any) {
    console.error('Erro ao criar denúncia:', error);
    return res.status(500).json({ error: 'Erro interno ao processar denúncia.' });
  }
};

export const getAllReports = async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user.roles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    const { page, limit, skip } = parsePagination(req.query);
    const reportRepo = AppDataSource.getRepository(Report);
    const qb = reportRepo.createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .orderBy('report.created_at', 'DESC');

    if (req.query.status && VALID_STATUSES_FILTER.includes(req.query.status)) {
      qb.andWhere('report.status = :status', { status: req.query.status });
    }
    if (req.query.type && VALID_TYPES_FILTER.includes(req.query.type)) {
      qb.andWhere('report.type = :type', { type: req.query.type });
    }

    const [reports, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const commentRepo = AppDataSource.getRepository(Comment);
    const safeReports = [];
    for (const report of reports) {
      const { password_hash, ...safeReporter } = report.reporter as any;
      const base: any = { ...report, reporter: safeReporter };

      if (report.type === 'REVIEW') {
        const comment = await commentRepo.findOne({
          where: { id: report.target_id },
          relations: { author_user: true, profile_user: true },
        });
        if (comment) {
          base.review = {
            id: comment.id,
            content: comment.content,
            author_id: comment.author_user?.id ?? null,
            author_name: comment.author_user?.name ?? null,
            profile_id: comment.profile_user?.id ?? null,
          };
        } else {
          base.review = null; // já foi removida
        }
      }
      safeReports.push(base);
    }

    return res.status(200).json(buildPage(safeReports, total, page, limit));
  } catch (error: any) {
    console.error('Erro ao buscar denúncias:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar denúncias.' });
  }
};

export const getReportStats = async (req: any, res: Response) => {
  try {
    if (!req.user.roles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    const reportRepo = AppDataSource.getRepository(Report);
    const [total, pending, resolved, dismissed] = await Promise.all([
      reportRepo.count(),
      reportRepo.count({ where: { status: 'PENDING' } }),
      reportRepo.count({ where: { status: 'RESOLVED' } }),
      reportRepo.count({ where: { status: 'DISMISSED' } }),
    ]);
    return res.json({ total, pending, resolved, dismissed });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas de denúncias:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const updateReportStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = req.user;
    if (!user.roles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const VALID_STATUSES = ['PENDING', 'RESOLVED', 'DISMISSED'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const reportRepo = AppDataSource.getRepository(Report);
    

    await reportRepo.update(id, { status });


    const updatedReport = await reportRepo.findOne({ where: { id } });

    return res.status(200).json({ message: 'Status atualizado.', report: updatedReport });
  } catch (error: any) {
    console.error('Erro ao atualizar denúncia:', error);
    return res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
};