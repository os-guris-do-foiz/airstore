import crypto from 'crypto';
import { MoreThan } from 'typeorm';
import { AppDataSource } from '../db/index';
import { VerificationCode } from '../domains/verificationCode';
import { sendVerificationEmail, sendPasswordResetEmail } from './mailService';

export type CodePurpose = 'VERIFY_EMAIL' | 'RESET_PASSWORD';

const CODE_TTL_MS = 15 * 60 * 1000;     // código vale por 15 minutos
const RESEND_COOLDOWN_MS = 60 * 1000;   // 1 min entre reenvios pro mesmo e-mail
const MAX_ATTEMPTS = 5;                 // tentativas erradas até o código morrer

const hashCode = (code: string) =>
  crypto.createHash('sha256').update(code).digest('hex');

export const issueCode = async (email: string, purpose: CodePurpose) => {
  const repo = AppDataSource.getRepository<VerificationCode>('VerificationCode');
  const normalized = email.trim().toLowerCase();

  const recent = await repo.findOne({
    where: { email: normalized, purpose, created_at: MoreThan(new Date(Date.now() - RESEND_COOLDOWN_MS)) },
  });
  if (recent) {
    throw new Error('Aguarde 1 minuto antes de pedir um novo código.');
  }

  await repo.update({ email: normalized, purpose, used: false }, { used: true });

  const code = crypto.randomInt(100000, 1000000).toString();
  await repo.save(repo.create({
    email: normalized,
    code_hash: hashCode(code),
    purpose,
    expires_at: new Date(Date.now() + CODE_TTL_MS),
  }));

  if (purpose === 'VERIFY_EMAIL') await sendVerificationEmail(normalized, code);
  else await sendPasswordResetEmail(normalized, code);
};

export const consumeCode = async (email: string, code: string, purpose: CodePurpose) => {
  const repo = AppDataSource.getRepository<VerificationCode>('VerificationCode');
  const normalized = email.trim().toLowerCase();

  const entry = await repo.findOne({
    where: { email: normalized, purpose, used: false },
    order: { created_at: 'DESC' },
  });

  if (!entry || entry.expires_at < new Date()) {
    throw new Error('Código expirado ou inexistente. Solicite um novo.');
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    throw new Error('Muitas tentativas erradas. Solicite um novo código.');
  }

  if (hashCode(String(code).trim()) !== entry.code_hash) {
    entry.attempts += 1;
    await repo.save(entry);
    const left = MAX_ATTEMPTS - entry.attempts;
    throw new Error(left > 0 ? `Código incorreto. ${left} tentativa(s) restante(s).` : 'Muitas tentativas erradas. Solicite um novo código.');
  }

  entry.used = true;
  await repo.save(entry);
};
