import { Request, Response } from 'express';
import { AppDataSource } from '../db/index';
import { Report } from '../domains/report';

export const createReport = async (req: any, res: Response) => {
  try {
    const { target_id, type, reason, description } = req.body;
    const reporter_id = req.user.id;

    if (!target_id || !type || !reason) {
      return res.status(400).json({ error: 'Campos obrigatórios: target_id, type e reason.' });
    }

    const reportRepo = AppDataSource.getRepository(Report);
    const newReport = reportRepo.create({
      reporter: { id: reporter_id },
      target_id,
      type,
      reason,
      description,
    });

    await reportRepo.save(newReport);
    return res.status(201).json({ message: 'Denúncia enviada com sucesso.', report: newReport });
  } catch (error: any) {
    console.error('Erro ao criar denúncia:', error);
    return res.status(500).json({ error: 'Erro interno ao processar denúncia.' });
  }
};

export const getAllReports = async (req: any, res: Response) => {
  try {
    // Apenas admins podem ver todos os reportes
    const user = req.user;
    if (!user.roles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    const reportRepo = AppDataSource.getRepository(Report);
    const reports = await reportRepo.find({
      relations: { reporter: true }, // Traz quem fez a denúncia
      order: { created_at: 'DESC' },
    });

    const safeReports = reports.map(report => {
      const { password_hash, ...safeReporter } = report.reporter;
      return { ...report, reporter: safeReporter };
    });

    return res.status(200).json(safeReports);
  } catch (error: any) {
    console.error('Erro ao buscar denúncias:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar denúncias.' });
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

    const reportRepo = AppDataSource.getRepository(Report);
    

    await reportRepo.update(id, { status });


    const updatedReport = await reportRepo.findOne({ where: { id } });

    return res.status(200).json({ message: 'Status atualizado.', report: updatedReport });
  } catch (error: any) {
    console.error('Erro ao atualizar denúncia:', error);
    return res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
};