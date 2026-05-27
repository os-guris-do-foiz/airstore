import { AppDataSource } from '../db/index';
import { User } from '../domains/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fronteira-super-secret-key';

export const loginUser = async (email: string, password_raw: string) => {

  const userRepo = AppDataSource.getRepository<User>("User");
  
  const user = await userRepo.findOne({ where: { email } });
  if (!user) throw new Error('Usuário não encontrado.');

  const isPasswordValid = await bcrypt.compare(password_raw, user.password_hash);
  if (!isPasswordValid) throw new Error('Credenciais inválidas.');

  let roles = user.roles || ['USER']; 
  const token = jwt.sign({ id: user.id, roles }, JWT_SECRET, { expiresIn: '7d' });

  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const registerUser = async (name: string, email: string, password_raw: string, city?: string) => {

  const userRepo = AppDataSource.getRepository<User>("User");
  
  const existingUser = await userRepo.findOne({ where: { email } });
  if (existingUser) throw new Error('Este e-mail já está em uso.');

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password_raw, salt);

  const newUser = userRepo.create({
    name,
    email,
    password_hash,
    city: city || null,
  });

  await userRepo.save(newUser);

  const { password_hash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};