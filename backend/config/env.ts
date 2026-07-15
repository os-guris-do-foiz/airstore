const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  throw new Error(
    "JWT_SECRET ausente ou muito curto no .env. Gere um com: openssl rand -hex 32"
  );
}

export const JWT_SECRET: string = secret;
