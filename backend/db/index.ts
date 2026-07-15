import { DataSource } from "typeorm";
import bcrypt from "bcryptjs"; // <-- Importamos o bcrypt para criptografar a senha do Admin
import crypto from "crypto";

import { User } from "../domains/user";
import { Ad } from "../domains/ad";
import { Comment } from "../domains/comment";
import { Rating } from "../domains/rating";
import { Report } from "../domains/report";
import { Field } from "../domains/field";
import { Event } from "../domains/event";
import { EventParticipant } from "../domains/eventParticipant";
import { Notification } from "../domains/notification";
import { Team } from "../domains/team";
import { TeamMember } from "../domains/teamMember";
import { VerificationCode } from "../domains/verificationCode";
import { Donation } from "../domains/donation";
import { Favorite } from "../domains/favorite";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== "production",
  logging: false,
  entities: [User, Ad, Comment, Rating, Report, Field, Event, EventParticipant, Notification, Team, TeamMember, VerificationCode, Donation, Favorite],
});

export const initDatabase = async () => {
  try {
    console.log('⚙️  Iniciando conexão com o Postgres via TypeORM...');
    await AppDataSource.initialize();
    console.log('✅ Banco de dados conectado! Tabelas criadas/sincronizadas com sucesso.');

    try {
      await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
      await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS unaccent');
    } catch (extError) {
      console.warn('⚠️  Não foi possível criar as extensões pg_trgm/unaccent (busca de anúncios pode falhar):', extError);
    }


    const userRepo = AppDataSource.getRepository(User);
    const adminEmail = "admin@fronteira.com";
    
   
    const adminExists = await userRepo.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      console.log('🔨 Conta de Administrador não encontrada. Criando agora...');

      const generated = !process.env.ADMIN_PASSWORD;
      const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(adminPassword, salt);

      const adminUser = userRepo.create({
        name: "Comandante Admin",
        email: adminEmail,
        password_hash: password_hash,
        city: "Base Central",
        roles: ["ADMIN", "USER"],
        is_donor: true,
        email_verified: true // conta interna — não passa pela verificação
      });

      await userRepo.save(adminUser);
      console.log('👑 Administrador criado com sucesso!');
      console.log(`👉 E-mail: ${adminEmail}`);
      if (generated) {
        console.log(`👉 Senha gerada (anote, não será exibida de novo): ${adminPassword}`);
        console.log('   Para definir uma senha fixa, use ADMIN_PASSWORD no .env.');
      }
    }

  } catch (error) {
    console.error('❌ Erro fatal ao tentar conectar no banco:', error);
    process.exit(1);
  }
};