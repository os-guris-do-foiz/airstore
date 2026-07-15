import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path"; // <-- Importamos isso para lidar com caminhos de pastas
import multer from "multer";
import { initDatabase } from "./backend/db/index";
import routes from "./backend/routes/index";
import { createServer as createViteServer } from "vite";

const startServer = async () => {
  try {
    const app = express();

    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim());
    app.use(cors({ origin: allowedOrigins }));

    app.use(express.json({ limit: '1mb' }));

    app.use((_req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    });

    app.use((req, res, next) => {
      if (!req.originalUrl.startsWith('/api')) return next();
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode >= 500 ? `🔴 ${res.statusCode}` : 
                       res.statusCode >= 400 ? `🟡 ${res.statusCode}` : 
                       res.statusCode >= 300 ? `🔵 ${res.statusCode}` : 
                       `🟢 ${res.statusCode}`;
        console.log(`[${req.method}] ${req.originalUrl} - Status: ${status} (${duration}ms)`);
      });
      next();
    });
    
    await initDatabase();

    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    app.use("/api", routes);

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!req.originalUrl.startsWith('/api')) return next(err);

      if (err instanceof multer.MulterError) {
        const messages: Record<string, string> = {
          LIMIT_FILE_SIZE: "Arquivo muito grande. O tamanho máximo por imagem é 5MB.",
          LIMIT_FILE_COUNT: "Quantidade de imagens excede o limite permitido.",
          LIMIT_UNEXPECTED_FILE: "Quantidade de imagens excede o limite permitido.",
        };
        return res.status(400).json({ error: messages[err.code] || err.message });
      }

      if (err?.message === 'Apenas arquivos de imagem são permitidos') {
        return res.status(400).json({ error: err.message });
      }

      next(err);
    });

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!req.originalUrl.startsWith('/api')) return next(err);
      console.error('💥 Erro não tratado na API:', err);
      if (res.headersSent) return next(err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    });

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa', 
    });
    
    app.use(vite.middlewares);

    app.listen(3000, () => {
      console.log("🚀 Servidor Node rodando na porta 3000!");
      console.log("🛡️  Fronteira Airsoft API está online.");
      console.log("💻 Frontend disponível em http://localhost:3000");
    });
  } catch (error) {
    console.error("❌ Falha crítica ao iniciar o servidor:", error);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('💥 Promise rejeitada sem tratamento:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('💥 Exceção não capturada:', err);
});

startServer();