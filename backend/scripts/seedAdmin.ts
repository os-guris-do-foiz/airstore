import "reflect-metadata";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../db/index";
import { User } from "../domains/user";

const ADMIN = {
  name: "Admin Teste",
  email: "adm@adm.com",
  password: "123456",
};

const seedAdmin = async () => {
  try {
    console.log("⚙️  Conectando ao banco...");
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { email: ADMIN.email } });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(ADMIN.password, salt);

    if (existing) {
      existing.password_hash = password_hash;
      existing.roles = Array.from(new Set([...(existing.roles || []), "ADMIN", "USER"]));
      existing.status = "ACTIVE";
      await userRepo.save(existing);
      console.log("♻️  Admin de teste já existia — senha e cargos atualizados.");
    } else {
      const admin = userRepo.create({
        name: ADMIN.name,
        email: ADMIN.email,
        password_hash,
        city: "Base de Teste",
        roles: ["ADMIN", "USER"],
        is_donor: true,
      });
      await userRepo.save(admin);
      console.log("👑 Admin de teste criado com sucesso!");
    }

    console.log("--------------------------------------");
    console.log(`👉 E-mail: ${ADMIN.email}`);
    console.log(`👉 Senha:  ${ADMIN.password}`);
    console.log("--------------------------------------");

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao criar o admin de teste:", error);
    process.exit(1);
  }
};

seedAdmin();
