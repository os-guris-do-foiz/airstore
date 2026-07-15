import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db/index';
import { User } from '../domains/user';
import { JWT_SECRET } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    roles: string[];
  };
}

const isBanned = async (userId: string): Promise<boolean> => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  return !user || user.status === 'BANNED';
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' ');

  let decoded: { id: string; roles: string[] };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: string; roles: string[] };
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }

  try {
    if (await isBanned(decoded.id)) {
      return res.status(403).json({ error: 'Sua conta foi banida.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao validar autenticação.' });
  }

  req.user = decoded;
  return next();
};

export const optionalAuthenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const [, token] = authHeader.split(' ');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; roles: string[] };
    if (!(await isBanned(decoded.id))) {
      req.user = decoded;
    }
  } catch {
  }
  return next();
};

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ error: 'Acesso negado: permissão insuficiente.' });
    }

    return next();
  };
};
