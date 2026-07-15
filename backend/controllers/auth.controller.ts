import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AppDataSource } from '../db/index';
import { User } from '../domains/user';

export const me = async (req: any, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id: req.user?.id } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    const { password_hash, ...safe } = user;
    return res.json(safe);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const { user, token } = await authService.loginUser(email, password);

    return res.status(200).json({
      message: 'Login bem sucedido',
      token,
      user
    });
  } catch (error: any) {
    return res.status(401).json({ error: error.message, code: error.code });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios para cadastro.' });
    }

    const user = await authService.registerUser(name, email, password, city);

    return res.status(201).json({
      message: 'Cadastro realizado! Enviamos um código de verificação para o seu e-mail.',
      user
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'E-mail e código são obrigatórios.' });
    }
    await authService.verifyEmail(email, code);
    return res.json({ message: 'E-mail verificado com sucesso! Você já pode fazer login.' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const resendCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-mail é obrigatório.' });
    await authService.resendVerification(email);
    return res.json({ message: 'Novo código enviado! Confira a sua caixa de entrada (e o spam).' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-mail é obrigatório.' });
    await authService.forgotPassword(email);
    return res.json({ message: 'Se este e-mail estiver cadastrado, um código foi enviado para ele.' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'E-mail, código e nova senha são obrigatórios.' });
    }
    await authService.resetPassword(email, code, newPassword);
    return res.json({ message: 'Senha redefinida com sucesso! Faça login com a nova senha.' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
    }
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return res.json({ message: 'Senha alterada com sucesso!' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
