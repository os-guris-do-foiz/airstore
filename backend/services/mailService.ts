import nodemailer from 'nodemailer';

const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const FROM = process.env.MAIL_FROM || `"Fronteira Airsoft" <${process.env.SMTP_USER}>`;

const codeEmailHtml = (title: string, intro: string, code: string) => `
  <div style="background:#0a0a0f;padding:40px 16px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:480px;margin:0 auto;background:#14141c;border:1px solid #2a2a38;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#a855f7,#7c3aed);padding:24px;text-align:center">
        <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:2px">FRONTEIRA AIRSOFT</span>
      </div>
      <div style="padding:32px 28px;color:#d1d5db">
        <h2 style="color:#fff;margin:0 0 12px;font-size:18px">${title}</h2>
        <p style="font-size:14px;line-height:1.6;margin:0 0 24px">${intro}</p>
        <div style="background:#0a0a0f;border:1px solid #c6ff2e;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
          <span style="color:#c6ff2e;font-size:34px;font-weight:900;letter-spacing:10px">${code}</span>
        </div>
        <p style="font-size:12px;color:#6b7280;margin:0">
          O código expira em 15 minutos. Se você não solicitou isso, ignore este e-mail.
        </p>
      </div>
    </div>
  </div>
`;

const send = async (to: string, subject: string, html: string, code: string) => {
  if (!transporter) {
    console.log('📧 [DEV] SMTP não configurado — código para', to, '→', code);
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html });
};

export const sendVerificationEmail = (to: string, code: string) =>
  send(
    to,
    `${code} é o seu código de verificação — Fronteira Airsoft`,
    codeEmailHtml(
      'Confirme o seu e-mail',
      'Bem-vindo à base! Use o código abaixo para confirmar o seu e-mail e ativar a sua conta.',
      code
    ),
    code
  );

export const sendPasswordResetEmail = (to: string, code: string) =>
  send(
    to,
    `${code} é o seu código de recuperação — Fronteira Airsoft`,
    codeEmailHtml(
      'Recuperação de senha',
      'Recebemos um pedido para redefinir a sua senha. Use o código abaixo para criar uma nova.',
      code
    ),
    code
  );

export const isMailConfigured = () => smtpConfigured;
