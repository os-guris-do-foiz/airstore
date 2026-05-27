import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const { user, token } = await authService.loginUser(email, password);
    
    // Retorna status 200 e dados do usuário simulando o login
    return res.status(200).json({
      message: 'Login bem sucedido',
      token, 
      user
    });
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
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
      message: 'Usuário cadastrado com sucesso!',
      user
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
