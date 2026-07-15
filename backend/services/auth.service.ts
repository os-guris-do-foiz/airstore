import { AppDataSource } from '../db/index';
import { User } from '../domains/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { issueCode, consumeCode } from './verificationService';

const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 10);

const ENFORCE_EMAIL_VERIFICATION = false;

export const loginUser = async (email: string, password_raw: string) => {

  const userRepo = AppDataSource.getRepository<User>("User");

  const user = await userRepo.findOne({ where: { email: String(email).trim().toLowerCase() } });
  if (!user) {
    await bcrypt.compare(password_raw, DUMMY_HASH);
    throw new Error('Credenciais inválidas.');
  }

  const isPasswordValid = await bcrypt.compare(password_raw, user.password_hash);
  if (!isPasswordValid) throw new Error('Credenciais inválidas.');

  if (user.status === 'BANNED') throw new Error('Sua conta foi banida. Entre em contato com o suporte.');

  if (ENFORCE_EMAIL_VERIFICATION && !user.email_verified) {
    const err: any = new Error('E-mail ainda não verificado. Confirme o código enviado para o seu e-mail.');
    err.code = 'EMAIL_NOT_VERIFIED';
    throw err;
  }

  let roles = user.roles || ['USER'];
  const token = jwt.sign({ id: user.id, roles }, JWT_SECRET, { expiresIn: '7d' });

  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const registerUser = async (name: string, email: string, password_raw: string, city?: string) => {

  const userRepo = AppDataSource.getRepository<User>("User");

  email = String(email).trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('E-mail inválido.');
  }
  if (typeof password_raw !== 'string' || password_raw.length < 8) {
    throw new Error('A senha deve ter pelo menos 8 caracteres.');
  }

  const existingUser = await userRepo.findOne({ where: { email } });
  if (existingUser) throw new Error('Este e-mail já está em uso.');

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password_raw, salt);

  const roles = ['USER'];

  const newUser = userRepo.create({
    name,
    email,
    password_hash,
    city: city || null,
    roles,
  });

  await userRepo.save(newUser);

  try {
    await issueCode(newUser.email, 'VERIFY_EMAIL');
  } catch (e) {
    console.error('Falha ao enviar código de verificação:', e);
  }

  const { password_hash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const verifyEmail = async (email: string, code: string) => {
  const userRepo = AppDataSource.getRepository<User>("User");
  const user = await userRepo.findOne({ where: { email: email.trim().toLowerCase() } });
  if (!user) throw new Error('Conta não encontrada para este e-mail.');
  if (user.email_verified) return true; // já verificado, nada a fazer

  await consumeCode(user.email, code, 'VERIFY_EMAIL');
  await userRepo.update(user.id, { email_verified: true });
  return true;
};

export const resendVerification = async (email: string) => {
  const userRepo = AppDataSource.getRepository<User>("User");
  const user = await userRepo.findOne({ where: { email: email.trim().toLowerCase() } });
  if (!user) throw new Error('Conta não encontrada para este e-mail.');
  if (user.email_verified) throw new Error('Este e-mail já foi verificado. Faça login normalmente.');

  await issueCode(user.email, 'VERIFY_EMAIL');
};

export const forgotPassword = async (email: string) => {
  const userRepo = AppDataSource.getRepository<User>("User");
  const user = await userRepo.findOne({ where: { email: email.trim().toLowerCase() } });
  if (!user) return;

  await issueCode(user.email, 'RESET_PASSWORD');
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
  }

  const userRepo = AppDataSource.getRepository<User>("User");
  const user = await userRepo.findOne({ where: { email: email.trim().toLowerCase() } });
  if (!user) throw new Error('Código expirado ou inexistente. Solicite um novo.');

  await consumeCode(user.email, code, 'RESET_PASSWORD');

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(newPassword, salt);
  await userRepo.update(user.id, { password_hash, email_verified: true });
  return true;
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
  }

  const userRepo = AppDataSource.getRepository<User>("User");
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw new Error('Usuário não encontrado.');

  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) throw new Error('Senha atual incorreta.');

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(newPassword, salt);
  await userRepo.update(userId, { password_hash });
  return true;
};