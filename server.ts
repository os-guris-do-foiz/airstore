import "reflect-metadata"; 
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path"; // <-- Importamos isso para lidar com caminhos de pastas
import { initDatabase } from "./backend/db/index"; 
import routes from "./backend/routes/index";      
import { createServer as createViteServer } from "vite"; 

const startServer = async () => {
  try {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Bloco do fofoqueiro (Log)
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
    
    // 1º PASSO: Inicia o Banco de Dados
    await initDatabase();

    // 🚨 2º PASSO (O SEGREDO DAS IMAGENS): Libera a pasta uploads para a internet!
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // 3º PASSO: Conecta as rotas do Backend
    app.use("/api", routes);

    // 4º PASSO: Conecta o Frontend (Vite)
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

startServer();