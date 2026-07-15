import "reflect-metadata";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../db/index";
import { User } from "../domains/user";
import { TeamMember } from "../domains/teamMember";
import * as teamService from "../services/teamService";
import * as fieldService from "../services/fieldService";
import * as eventService from "../services/eventService";
import * as adService from "../services/adservice";
import * as userService from "../services/userService";

const DEMO_PASSWORD = "Senha@123";

const DEMO_IMAGES = [
  "03ae88ac17a16bf15e8d5897377a2529",
  "1079a5d9e95db97e83ec7c565448772e",
  "1f3c2d401ae95420f3acb9ead6e3358a",
  "24161f9ec95a67e0c84a124a5876d721",
  "2cbed17b221462d8bfbf35cafea8c820",
  "3e69b1fb7f9430d6a849acf61b4307ba",
  "5587684fa0ef40b8bcccec39b2e08ab5",
  "634b2efb7a2923f3fbce2307343e4e8c",
  "7293faef9564a17bde40b97db77a27b5",
  "871854e69c7a055507ce6d4c6aed005e",
  "87b6eedb7dd2960c531d672563aa025f",
  "ac754015b656f993440fb9c84800f76d",
  "b5c540202029fb2115db6cea666e0d5c",
  "d51deda5c13b24b46ea4f60723247a41",
  "e692d5f616d3e200b72ff9e3a7d5d1cd",
  "fe68fef81135e62860566b1e5deb7bfa",
].map((h) => `/uploads/${h}`);

const img = (offset: number, count = 1) =>
  Array.from({ length: count }, (_, i) => DEMO_IMAGES[(offset + i) % DEMO_IMAGES.length]);

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]) => arr[randInt(0, arr.length - 1)];
const stripAccents = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

const NAMES = [
  "Lucas Andrade", "Rafael Souza", "Bruno Costa", "Gabriel Lima", "Thiago Ferreira",
  "Mariana Silva", "Camila Rocha", "Fernanda Alves", "Juliana Martins", "Patrícia Gomes",
  "Diego Cardoso", "Eduardo Ramos", "Felipe Barros", "André Nunes", "Marcelo Teixeira",
  "Vinícius Pereira", "Rodrigo Dias", "Leonardo Castro", "Carlos Eduardo Melo", "Renata Duarte",
];
const NICKNAMES = [
  "Ghost", "Reaper", "Falcon", "Viper", "Wolf", "Raven", "Hunter", "Phoenix", "Cobra", "Shadow",
  "Blaze", "Storm", "Titan", "Nomad", "Ranger", "Havoc", "Specter", "Rex", "Ironclad", "Valkyrie",
];
const CITIES: [string, string][] = [
  ["Foz do Iguaçu, PR", "45"], ["Cascavel, PR", "45"], ["Curitiba, PR", "41"], ["Londrina, PR", "43"],
  ["Maringá, PR", "44"], ["Ponta Grossa, PR", "42"], ["Toledo, PR", "45"], ["Medianeira, PR", "45"],
  ["Chapecó, SC", "49"], ["Florianópolis, SC", "48"], ["Joinville, SC", "47"], ["Porto Alegre, RS", "51"],
  ["Caxias do Sul, RS", "54"], ["São Paulo, SP", "11"], ["Campinas, SP", "19"], ["Guarulhos, SP", "11"],
  ["Sorocaba, SP", "15"], ["Rio de Janeiro, RJ", "21"], ["Belo Horizonte, MG", "31"], ["Uberlândia, MG", "34"],
];
const BIOS = [
  "Jogador de airsoft há 5 anos, especialista em CQB.",
  "Apaixonado por sniper e jogadas de longo alcance.",
  "Dono de loja de equipamentos táticos na região.",
  "Sempre em busca da próxima operação noturna.",
  "Colecionador de réplicas AEG full metal.",
  "Novo na modalidade, aprendendo rápido no campo.",
  "Organizo operações mensais com o esquadrão.",
  "Especialista em suporte e GPMG simulado.",
  "Gosto de jogar cenários MilSim de fim de semana.",
  "Vendo e troco equipamentos usados com responsabilidade.",
  "Fã de réplicas GBB e manutenção caseira.",
  "Sempre disponível para parceria em times.",
  "Prefiro jogos woodland a CQB indoor.",
  "Trabalho com upgrade e cronometragem de réplicas.",
  "Veterano de mais de 10 anos na modalidade.",
  "Busco time fixo para campeonatos regionais.",
  "Adoro fotografar as operações e editar highlights.",
  "Comecei jogando pistola e migrei para fuzil.",
  "Apoiador de eventos beneficentes de airsoft.",
  "Sempre disposto a ensinar iniciantes no campo.",
];

const AD_TEMPLATES = [
  { title: "Rifle AEG M4 Custom", model: "M4 / M16", type: "AEG", brand: "VFC", category: "Airsoft", condition: "Pouco Usada (MW)", range: [900, 1800], tags: ["m4", "aeg", "full-metal"] },
  { title: "Pistola GBB Glock 17", model: "Pistola", type: "GBB", brand: "Tokyo Marui", category: "Airsoft", condition: "Nova de Fábrica (FN)", range: [600, 1100], tags: ["glock", "gbb", "pistola"] },
  { title: "Sniper AWP Spring", model: "Sniper (Bolt Action)", type: "Spring", brand: "Well", category: "Airsoft", condition: "Testada em Campo (FT)", range: [500, 900], tags: ["sniper", "awp", "bolt-action"] },
  { title: "AEG AK47 Tático", model: "AK", type: "AEG", brand: "Cyma", category: "Airsoft", condition: "Pouco Usada (MW)", range: [750, 1400], tags: ["ak47", "aeg"] },
  { title: "Submetralhadora MP5 GBB", model: "SMG", type: "GBB", brand: "KWA", category: "Airsoft", condition: "Nova de Fábrica (FN)", range: [1200, 2200], tags: ["mp5", "gbb"] },
  { title: "Colete Tático Plate Carrier", model: "Outros", type: "Colete", brand: "Condor", category: "Kits", condition: "Nova de Fábrica (FN)", range: [250, 450], tags: ["colete", "tatico"] },
  { title: "Máscara de Proteção Full Face", model: "Outros", type: "Proteção", brand: "WoSport", category: "Peças", condition: "Nova de Fábrica (FN)", range: [120, 220], tags: ["mascara", "protecao"] },
  { title: "Kit Manutenção + Baterias LiPo", model: "Outros", type: "Kit", brand: "Genérico", category: "Kits", condition: "Nova de Fábrica (FN)", range: [180, 350], tags: ["bateria", "lipo", "manutencao"] },
  { title: "Hop-up Bucket + Cano Interno", model: "Outros", type: "Upgrade", brand: "Prometheus", category: "Peças", condition: "Nova de Fábrica (FN)", range: [90, 180], tags: ["hop-up", "upgrade"] },
  { title: "Serviço de Cronometragem e Upgrade", model: "Serviço", type: "Manutenção", brand: null, category: "Serviços", condition: null, range: [80, 300], tags: ["servico", "cronometragem"] },
  { title: "Combo Iniciante AEG + Óculos + Máscara", model: "Outros", type: "Combo", brand: "Cyma", category: "Combos", condition: "Nova de Fábrica (FN)", range: [700, 1200], tags: ["combo", "iniciante"] },
  { title: "Pistola GBB P226", model: "Pistola", type: "GBB", brand: "WE", category: "Airsoft", condition: "Pouco Usada (MW)", range: [550, 950], tags: ["p226", "gbb"] },
  { title: "Shotgun M870 Spring", model: "Shotgun", type: "Spring", brand: "Cyma", category: "Airsoft", condition: "Testada em Campo (FT)", range: [400, 700], tags: ["shotgun", "m870"] },
  { title: "Scar-L AEG Full Metal", model: "Outros", type: "AEG", brand: "Classic Army", category: "Airsoft", condition: "Nova de Fábrica (FN)", range: [1500, 2800], tags: ["scar", "aeg", "full-metal"] },
  { title: "P90 AEG Compacta", model: "SMG", type: "AEG", brand: "Cybergun", category: "Airsoft", condition: "Pouco Usada (MW)", range: [900, 1600], tags: ["p90", "aeg"] },
];

const REVIEW_TEXTS = [
  "Negociação tranquila, produto exatamente como descrito. Recomendo!",
  "Ótimo vendedor, entrega rápida e bem embalado.",
  "Jogador correto, combinamos tudo certinho pro jogo.",
  "Equipamento em ótimo estado, superou expectativas.",
  "Comunicação boa, mas demorou um pouco pra combinar a entrega.",
  "Excelente parceiro de time, sempre pontual nas operações.",
  "Produto ok, preço justo pelo estado de conservação.",
  "Recomendo, negócio limpo e sem enrolação.",
];

async function main() {
  console.log("⚙️  Conectando ao banco...");
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository<User>("User");
  const memberRepo = AppDataSource.getRepository<TeamMember>("TeamMember");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("👥 Criando 20 usuários...");
  const users: User[] = [];
  for (let i = 0; i < 20; i++) {
    const name = NAMES[i];
    const [city, ddd] = CITIES[i];
    const emailLocal = stripAccents(name).toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.+|\.+$/g, "");

    const isFieldOwner = i < 4;
    const isPremium = i === 4 || i === 5;
    const isBanned = i === 6;
    const isUnverified = i === 7;

    const roles = ["USER"];
    if (isFieldOwner) roles.unshift("FIELD_OWNER");
    if (isPremium) roles.push("PREMIUM");

    const user = userRepo.create({
      name,
      email: `${emailLocal}@teste.com`,
      password_hash: passwordHash,
      city,
      nickname: NICKNAMES[i],
      bio: BIOS[i],
      avatar: img(i)[0],
      banner: i % 2 === 0 ? img(i + 5)[0] : null,
      roles,
      status: isBanned ? "BANNED" : "ACTIVE",
      email_verified: !isUnverified,
      is_donor: isPremium,
      donor_expiry: isPremium ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) : null,
      field_limit: isFieldOwner ? (i < 2 ? 2 : 1) : 0,
    });
    await userRepo.save(user);
    (user as any)._ddd = ddd;
    users.push(user);
  }

  console.log("🛒 Criando anúncios diversificados...");
  let adCount = 0;
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const ddd = (u as any)._ddd;
    const numAds = randInt(1, 3);
    for (let j = 0; j < numAds; j++) {
      const t = pick(AD_TEMPLATES);
      const price = randInt(t.range[0], t.range[1]);
      await adService.createAd(u.id, {
        title: t.title,
        description: `${t.title} em ótimo estado, pouco uso. Aceito combinar retirada ou envio. Qualquer dúvida chama no zap.`,
        price,
        location: u.city,
        category: t.category,
        whatsapp: `(${ddd}) 9${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
        tags: t.tags,
        images: img(adCount, randInt(1, 2)),
        model: t.model,
        brand: t.brand,
        fps: t.category === "Airsoft" ? String(randInt(280, 420)) : null,
        type: t.type,
        condition: t.condition,
        accepts_trade: Math.random() < 0.35,
        is_sold: Math.random() < 0.12,
      });
      adCount++;
    }
  }
  console.log(`   → ${adCount} anúncios criados.`);

  console.log("🛡️  Criando times...");
  const teamDefs = [
    { name: "Esquadrão Fronteira", creator: 0, visibility: "PUBLIC", notice: "Treino toda quarta às 19h na Base Alpha.", members: [1, 8, 9, 10], pending: [11], announcement: true },
    { name: "Black Wolves Team", creator: 1, visibility: "PUBLIC", notice: null, members: [2, 12, 13], pending: [], announcement: false },
    { name: "Ronin Ops", creator: 2, visibility: "PRIVATE", notice: "Link de convite só pro grupo do WhatsApp.", members: [3, 14], pending: [15], announcement: false },
    { name: "Delta Force BR", creator: 3, visibility: "PUBLIC", notice: null, members: [16, 17, 18], pending: [], announcement: true },
    { name: "Attitude Airsoft Clan", creator: 5, visibility: "PRIVATE", notice: "Time fechado, foco em MilSim.", members: [19], pending: [], announcement: false },
  ];

  let teamCount = 0;
  for (const def of teamDefs) {
    const creator = users[def.creator];
    const team: any = await teamService.createTeam(creator.id, {
      name: def.name,
      description: `Time de airsoft ${def.name} — competitivo e recreativo, sempre em busca de novos operadores.`,
      visibility: def.visibility,
      notice: def.notice,
      avatar: img(teamCount)[0],
      banner: img(teamCount + 3)[0],
    });
    teamCount++;

    for (const idx of def.members) {
      try {
        await teamService.joinTeam(team.id, users[idx].id);
      } catch (e: any) {
        console.log(`   (aviso) ${users[idx].name} não entrou em ${def.name}: ${e.message}`);
      }
    }
    for (const idx of def.pending) {
      try {
        await teamService.joinTeam(team.id, users[idx].id);
      } catch (e: any) {
        console.log(`   (aviso) ${users[idx].name} não solicitou entrada em ${def.name}: ${e.message}`);
      }
    }

    if (def.announcement) {
      await teamService.setAnnouncement(team.id, {
        title: "Buscamos novos operadores!",
        description: "Time em expansão — venha treinar com a gente, iniciantes são bem-vindos.",
        image: img(teamCount + 7)[0],
      }, true);
    }
  }
  console.log(`   → ${teamCount} times criados.`);

  const feature = async (userIdx: number) => {
    const member = await memberRepo.findOne({ where: { user: { id: users[userIdx].id }, status: "ACTIVE" }, relations: { team: true } });
    if (member) {
      try { await teamService.setFeaturedTeam(users[userIdx].id, member.team.id); } catch { /* ignora */ }
    }
  };
  await feature(0);
  await feature(1);
  await feature(3);

  console.log("🏕️  Criando campos...");
  const fieldDefs = [
    {
      name: "Base Alpha CQB", location: "Foz do Iguaçu, PR", type: "CQB Indoor",
      owners: [0], base_price: 40, rental_price: 25,
      rules: ["Uso obrigatório de proteção ocular", "Chamar 'hit' é obrigatório", "Proibido blowback sem redução de FPS"],
      infra: ["Estacionamento gratuito", "Banheiros", "Área de descanso coberta"],
    },
    {
      name: "Fronteira Woods", location: "Cascavel, PR", type: "Floresta / Woodland",
      owners: [1], base_price: 50, rental_price: 30,
      rules: ["Limite de FPS: 400 para fuzil, 350 para pistola", "Proibido flanquear staff", "Respeitar o horário de cessar-fogo"],
      infra: ["Estacionamento", "Loja de conveniência", "Aluguel de equipamento completo"],
    },
    {
      name: "Trilha Selvagem Airsoft Park", location: "Curitiba, PR", type: "Misto (CQB + Campo Aberto)",
      owners: [2, 3], base_price: 60, rental_price: 35,
      rules: ["Idade mínima 16 anos (menores com autorização)", "Uso de máscara full-face obrigatório em CQB"],
      infra: ["Estacionamento", "Banheiros", "Lanchonete", "Área kids (fora do campo)"],
    },
    {
      name: "Zona de Guerra Tático", location: "Londrina, PR", type: "CQB",
      owners: [] as number[], base_price: 45, rental_price: 0,
      rules: ["Regras a definir pelo novo administrador"],
      infra: ["Estacionamento"],
    },
  ];

  const fields: any[] = [];
  let fieldImgOffset = 0;
  for (const def of fieldDefs) {
    const field = await fieldService.createField({
      name: def.name,
      description: `${def.name} — arena de airsoft com estrutura completa para partidas ${def.type.toLowerCase()}.`,
      location: def.location,
      type: def.type,
      base_price: def.base_price,
      rental_price: def.rental_price,
      whatsapp: `(${CITIES.find(([c]) => c === def.location)?.[1] || "45"}) 9${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
      cover: img(fieldImgOffset)[0],
      images: img(fieldImgOffset + 1, 3),
      rules: def.rules,
      infrastructure: def.infra,
      owner_ids: def.owners.map((idx) => users[idx].id),
    });
    fieldImgOffset += 4;
    fields.push(field);
  }
  console.log(`   → ${fields.length} campos criados.`);

  console.log("🎯 Criando partidas (eventos)...");
  const eventDefs = [
    { field: 0, creator: 8, title: "Operação CQB Noturna", date: "2026-06-20", start: "19:00", end: "23:00", visibility: "PUBLIC", max: 20, outcome: "APPROVED", joiners: [0, 9, 10, 11, 12] },
    { field: 0, creator: 9, title: "Treino Semanal CQB", date: "2026-07-20", start: "09:00", end: "13:00", visibility: "PUBLIC", max: 24, outcome: "APPROVED", joiners: [1, 13, 14] },
    { field: 0, creator: 0, title: "Seletiva Interna", date: "2026-07-27", start: "14:00", end: "18:00", visibility: "PRIVATE", max: 16, outcome: "APPROVED", joiners: [8, 15] },
    { field: 1, creator: 12, title: "MilSim Fronteira", date: "2026-06-15", start: "08:00", end: "17:00", visibility: "PUBLIC", max: 40, outcome: "APPROVED", joiners: [1, 13, 16, 17, 18, 19] },
    { field: 1, creator: 1, title: "Operação Selva", date: "2026-07-19", start: "08:00", end: "16:00", visibility: "PUBLIC", max: 40, outcome: "PENDING", joiners: [] },
    { field: 2, creator: 14, title: "Campeonato Regional", date: "2026-07-25", start: "08:00", end: "18:00", visibility: "PUBLIC", max: 60, outcome: "APPROVED", joiners: [2, 3, 15, 16, 17] },
    { field: 2, creator: 15, title: "Tentativa de Evento Cancelado", date: "2026-06-10", start: "10:00", end: "14:00", visibility: "PUBLIC", max: 20, outcome: "REJECTED", joiners: [] },
    { field: 3, creator: 18, title: "Abertura Zona de Guerra", date: "2026-08-01", start: "13:00", end: "19:00", visibility: "PUBLIC", max: 30, outcome: "PENDING", joiners: [] },
  ];

  let eventCount = 0;
  let participantCount = 0;
  for (const def of eventDefs) {
    const fieldId = fields[def.field].id;
    const creator = users[def.creator];
    const created: any = await eventService.createEvent(fieldId, creator.id, {
      title: def.title,
      date: def.date,
      start_time: def.start,
      end_time: def.end,
      visibility: def.visibility,
      max_players: def.max,
    });
    eventCount++;

    if (def.outcome !== "PENDING") {
      await eventService.setEventStatus(created.id, def.outcome);
    }

    if (def.outcome === "APPROVED") {
      for (const idx of def.joiners) {
        const player = users[idx];
        try {
          await eventService.joinEvent(created.id, player.id, player.name, Math.random() < 0.3, created.invite_token);
          participantCount++;
        } catch (e: any) {
          console.log(`   (aviso) ${player.name} não entrou em "${def.title}": ${e.message}`);
        }
      }
    }
  }
  console.log(`   → ${eventCount} partidas criadas, ${participantCount} inscrições.`);

  console.log("⭐ Criando avaliações entre usuários...");
  let reviewCount = 0;
  for (let i = 0; i < users.length; i++) {
    const author = users[i];
    const target = users[(i + 7) % users.length];
    try {
      await userService.createReview(target.id, author.id, randInt(3, 5), pick(REVIEW_TEXTS));
      reviewCount++;
    } catch (e: any) {
      console.log(`   (aviso) avaliação de ${author.name} não criada: ${e.message}`);
    }
  }
  console.log(`   → ${reviewCount} avaliações criadas.`);

  console.log("\n--------------------------------------");
  console.log("✅ Banco populado com sucesso!");
  console.log(`👥 ${users.length} usuários | 🛒 ${adCount} anúncios | 🛡️  ${teamCount} times | 🏕️  ${fields.length} campos | 🎯 ${eventCount} partidas | ⭐ ${reviewCount} avaliações`);
  console.log(`🔑 Senha de todos os usuários de teste: ${DEMO_PASSWORD}`);
  console.log("   E-mails: primeironome.sobrenome@teste.com (ex: lucas.andrade@teste.com)");
  console.log("--------------------------------------");

  await AppDataSource.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro ao popular o banco:", err);
  process.exit(1);
});
