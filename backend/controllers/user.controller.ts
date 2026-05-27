import { Request, Response } from "express";
import * as userService from "../services/userService";

export const getAll = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 👇 NOVOS CONTROLADORES DO ADMIN 👇
export const updateRoles = async (req: Request, res: Response) => {
  try {
    const success = await userService.updateUserRoles(req.params.id, req.body.roles);
    res.json({ success });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const success = await userService.updateUserStatus(req.params.id, req.body.status);
    res.json({ success });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};