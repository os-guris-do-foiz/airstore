import { DataSource } from "typeorm";
import bcrypt from "bcryptjs"; // <-- Importamos o bcrypt para criptografar a senha do Admin

// Importamos TODAS as nossas tabelas
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

    
    const userRepo = AppDataSource.getRepository(User);
    const adminEmail = "admin@fronteira.com";
    
   
    const adminExists = await userRepo.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      console.log('🔨 Conta de Administrador não encontrada. Criando agora...');
      
    
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash("admin123", salt);


      const adminUser = userRepo.create({
        name: "Comandante Admin",
        email: adminEmail,
        password_hash: password_hash,
        city: "Base Central",
        roles: ["ADMIN", "USER"], 
        is_donor: true 
      });

      await userRepo.save(adminUser);
      console.log('👑 Administrador criado com sucesso!');
      console.log('👉 E-mail: admin@fronteira.com');
      console.log('👉 Senha:  admin123');
    }
    // 👆 FIM DA CRIAÇÃO DO ADMIN 👆

  } catch (error) {
    console.error('❌ Erro fatal ao tentar conectar no banco:', error);
    process.exit(1);
  }
};