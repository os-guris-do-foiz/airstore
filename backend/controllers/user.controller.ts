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

export const addComment = async (req: any, res: Response) => {
  try {
    const { content } = req.body;
    const profileUserId = req.params.id;
    const authorUserId = req.user.id; // Pega o ID de quem está logado fazendo a ação
    
    const comment = await userService.addComment(profileUserId, authorUserId, content);
    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addRating = async (req: any, res: Response) => {
  try {
    const { score } = req.body;
    const profileUserId = req.params.id;
    const authorUserId = req.user.id;
    
    const result = await userService.addRating(profileUserId, authorUserId, score);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};