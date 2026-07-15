# Fronteira Airsoft

Marketplace tático da comunidade de airsoft: compra, venda e troca de
equipamentos, além de campos, times e serviços — tudo em um só lugar. A
plataforma atua como intermediária de divulgação; as negociações acontecem
diretamente entre os usuários (normalmente por WhatsApp).

## Stack

- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS v4, React Router, Motion.
- **Backend:** Node + Express, TypeORM, PostgreSQL.
- **Monolito:** o `server.ts` sobe a API Express e serve o frontend (Vite em
  middleware mode) na mesma porta (3000).
- **Testes:** Vitest.

## Rodando localmente

Pré-requisitos: Node.js (LTS 20/22), PostgreSQL rodando.

```bash
# 1. Instalar dependências
npm install

# 2. Configurar o ambiente
cp .env.example .env   # e preencher os valores (veja abaixo)

# 3. (Opcional) Popular dados de demonstração
npm run seed:demo

# 4. Subir em desenvolvimento (API + frontend na porta 3000)
npm run dev
```

Acesse http://localhost:3000.

## Scripts

| Script               | O que faz                                       |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Sobe API + frontend (porta 3000).               |
| `npm run start`      | Sobe em modo produção (`NODE_ENV=production`).  |
| `npm run build`      | Build do frontend (Vite).                       |
| `npm test`           | Roda a suíte de testes (Vitest).                |
| `npm run lint`       | Type-check do projeto (`tsc --noEmit`).         |
| `npm run seed:admin` | Cria/promove um admin.                          |
| `npm run seed:demo`  | Popula dados de demonstração.                   |

## Variáveis de ambiente

Definidas no `.env` (nunca comitado). Principais:

- `DATABASE_URL` — string de conexão do Postgres.
- `JWT_SECRET` — segredo do JWT (mínimo 32 caracteres; o app não sobe sem ele).
- `ADMIN_PASSWORD` — senha do admin criado no primeiro boot (e-mail fixo `admin@fronteira.com`).

Opcionais (recursos ficam desligados se ausentes):

- `SMTP_*` / `MAIL_FROM` — envio de e-mail (verificação/recuperação). Sem isso,
  o código aparece no console do servidor.
- `S3_*` — armazenamento de imagens em bucket S3-compatível (R2/S3/B2/Spaces).
  Sem isso, as imagens ficam em disco local (`uploads/`).
- `MP_ACCESS_TOKEN` — integração de doações via Mercado Pago.

## Estrutura

```
backend/     # API: controllers, services, domains (entidades TypeORM), rotas, middlewares
frontend/    # SPA React: pages, components, api (client), utils
server.ts    # entrypoint do monolito (API + Vite middleware)
uploads/     # imagens enviadas (dev; ignorado pelo git)
```

## Segurança

O projeto passou por auditorias de segurança documentadas em `.claude/`. Antes
de operar em produção, revise os itens ainda abertos (credenciais do banco,
verificação de e-mail, revogação de token, etc.).
