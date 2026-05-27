import { DataSource } from "typeorm";

// 1. Importamos TODAS as nossas tabelas
import { User } from "../domains/user";
import { Ad } from "../domains/ad";
import { Comment } from "../domains/comment";
import { Rating } from "../domains/rating";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, 
  logging: false,    
  entities: [User, Ad, Comment, Rating], 
});

export const initDatabase = async () => {
  try {
    console.log('⚙️  Iniciando conexão com o Postgres via TypeORM...');
    await AppDataSource.initialize();
    console.log('✅ Banco de dados conectado! Tabelas criadas/sincronizadas com sucesso.');
  } catch (error) {
    console.error('❌ Erro fatal ao tentar conectar no banco:', error);
    process.exit(1);
  }
};