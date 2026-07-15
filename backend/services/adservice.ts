import { AppDataSource } from "../db/index";
import { Ad } from "../domains/ad";
import { parsePagination, buildPage } from "../utils/pagination";
import { isActiveDonor } from "../utils/donor";

const ACTIVE_DONOR_SQL = "(user.is_donor = true AND (user.donor_expiry IS NULL OR user.donor_expiry > NOW()))";

const AD_SEARCH_TSVECTOR_SQL = `(
  setweight(to_tsvector('portuguese', unaccent(coalesce(ad.title, ''))), 'A') ||
  setweight(to_tsvector('portuguese', unaccent(coalesce(ad.brand, '') || ' ' || coalesce(ad.model, '') || ' ' || coalesce(ad.type, '') || ' ' || coalesce(ad.category, ''))), 'B') ||
  setweight(to_tsvector('portuguese', unaccent(coalesce(ad.description, '') || ' ' || array_to_string(ad.tags, ' '))), 'C')
)`;

const formatAd = (ad: Ad | null) => {
  if (!ad) return ad;
  const { user, price, ...rest } = ad as any;
  const safeUser = user
    ? (({ password_hash, email, ...clean }) => clean)(user)
    : null;

  return {
    ...rest,
    price: price != null ? Number(price) : price,
    user_id: user?.id ?? null,
    is_donor: isActiveDonor(user),
    user: safeUser,
  };
};

export const getAllAds = async (filters: any) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad"); // <-- Blindado!
  const { page, limit, skip } = parsePagination(filters);

  const qb = adRepo.createQueryBuilder("ad")
    .leftJoinAndSelect("ad.user", "user")
    .where("ad.is_sold = false");

  if (filters?.category) {
    qb.andWhere("(ad.category = :category OR ad.type = :category)", { category: filters.category });
  }

  if (filters?.type) {
    qb.andWhere("LOWER(ad.type) = LOWER(:type)", { type: filters.type });
  }
  if (filters?.condition) {
    qb.andWhere("LOWER(ad.condition) = LOWER(:condition)", { condition: filters.condition });
  }

  const minPrice = Number(filters?.minPrice);
  if (Number.isFinite(minPrice) && minPrice > 0) {
    qb.andWhere("ad.price >= :minPrice", { minPrice });
  }
  const maxPrice = Number(filters?.maxPrice);
  if (Number.isFinite(maxPrice) && maxPrice > 0) {
    qb.andWhere("ad.price <= :maxPrice", { maxPrice });
  }

  let hasSearch = false;
  if (filters?.search) {
    const q = String(filters.search).trim();
    if (q) {
      hasSearch = true;
      qb.andWhere(
        `(${AD_SEARCH_TSVECTOR_SQL} @@ plainto_tsquery('portuguese', unaccent(:q))
          OR word_similarity(unaccent(:q), unaccent(ad.title)) > 0.4
          OR word_similarity(unaccent(:q), unaccent(coalesce(ad.brand, ''))) > 0.4
          OR word_similarity(unaccent(:q), unaccent(coalesce(ad.model, ''))) > 0.4)`,
        { q }
      );
      qb.addSelect(
        `ts_rank_cd(${AD_SEARCH_TSVECTOR_SQL}, plainto_tsquery('portuguese', unaccent(:q))) +
         GREATEST(
           word_similarity(unaccent(:q), unaccent(ad.title)),
           word_similarity(unaccent(:q), unaccent(coalesce(ad.brand, ''))),
           word_similarity(unaccent(:q), unaccent(coalesce(ad.model, '')))
         )`,
        "search_rank"
      );
    }
  }

  qb.addSelect(ACTIVE_DONOR_SQL, "active_donor")
    .orderBy("active_donor", "DESC");

  if (filters?.sort === "price_asc") qb.addOrderBy("ad.price", "ASC");
  else if (filters?.sort === "price_desc") qb.addOrderBy("ad.price", "DESC");
  else if (filters?.sort === "views") qb.addOrderBy("ad.view_count", "DESC");
  else if (hasSearch) qb.addOrderBy("search_rank", "DESC");
  else qb.addOrderBy("ad.created_at", "DESC");

  qb.skip(skip).take(limit);

  const [ads, total] = await qb.getManyAndCount();
  return buildPage(ads.map(formatAd), total, page, limit);
};

const SPOTLIGHT_WINDOWS_HOURS = [24, 24 * 3, 24 * 7, 24 * 30];

export const getSpotlightAds = async (limit = 12) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad");

  const runQuery = async (sinceHours: number | null) => {
    const qb = adRepo.createQueryBuilder("ad")
      .leftJoinAndSelect("ad.user", "user")
      .where("ad.is_sold = false");

    if (sinceHours !== null) {
      qb.andWhere("ad.created_at >= :since", { since: new Date(Date.now() - sinceHours * 60 * 60 * 1000) });
    }

    qb.addSelect(ACTIVE_DONOR_SQL, "active_donor")
      .orderBy("active_donor", "DESC")
      .addOrderBy("ad.created_at", "DESC")
      .take(limit);

    return qb.getMany();
  };

  for (const hours of SPOTLIGHT_WINDOWS_HOURS) {
    const ads = await runQuery(hours);
    if (ads.length > 0) return ads.map(formatAd);
  }

  const ads = await runQuery(null);
  return ads.map(formatAd);
};

export const getAdsByUser = async (userId: string, page?: number, limit?: number) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  const { page: p, limit: l, skip } = parsePagination({ page, limit });

  const [ads, total] = await adRepo.findAndCount({
    where: { user: { id: userId } },
    relations: { user: true },
    order: { created_at: "DESC" },
    skip,
    take: l,
  });

  return buildPage(ads.map(formatAd), total, p, l);
};

export const getAdById = async (id: string) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  const ad = await adRepo.findOne({
    where: { id },
    relations: { user: true }
  });
  return formatAd(ad);
};

const VALID_CONDITIONS = [
  "Nova de Fábrica (FN)",
  "Pouco Usada (MW)",
  "Testada em Campo (FT)",
  "Bem Desgastada (WW)",
  "Veterana de Guerra (BS)",
];

const validateAdInput = (data: any) => {
  if (!data.title?.trim()) throw new Error("O título é obrigatório.");
  if (!data.description?.trim()) throw new Error("A descrição é obrigatória.");
  if (!data.location?.trim()) throw new Error("A localização é obrigatória.");
  const price = Number(data.price);
  if (!Number.isFinite(price) || price <= 0) throw new Error("Informe um preço válido.");
  if (!data.category?.trim()) throw new Error("Selecione uma categoria.");

  if (data.category !== "Serviços" && !VALID_CONDITIONS.includes(data.condition)) {
    throw new Error("Selecione o estado de conservação do equipamento.");
  }
};

const AD_CREATABLE_FIELDS = [
  "title", "description", "price", "location", "category", "whatsapp",
  "tags", "images", "model", "brand", "fps", "type", "condition",
  "accepts_trade",
] as const;

export const createAd = async (userId: string, adData: any) => {
  validateAdInput(adData);
  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  const payload: any = {};
  for (const key of AD_CREATABLE_FIELDS) {
    if (adData[key] !== undefined) payload[key] = adData[key];
  }
  const newAd = adRepo.create({ ...payload, user: { id: userId } }) as unknown as Ad;
  await adRepo.save(newAd);
  return await getAdById(newAd.id);
};

const AD_UPDATABLE_FIELDS = [
  "title", "description", "price", "location", "category", "whatsapp",
  "tags", "images", "model", "brand", "fps", "type", "condition",
  "accepts_trade", "is_sold",
] as const;

export const updateAd = async (id: string, adData: any) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  const payload: any = {};
  for (const key of AD_UPDATABLE_FIELDS) {
    if (adData[key] !== undefined) payload[key] = adData[key];
  }

  if (payload.condition !== undefined && payload.condition !== "N/A" && !VALID_CONDITIONS.includes(payload.condition)) {
    throw new Error("Selecione o estado de conservação do equipamento.");
  }
  if (payload.price !== undefined && !(Number(payload.price) > 0)) {
    throw new Error("Informe um preço válido.");
  }

  if (Object.keys(payload).length > 0) {
    await adRepo.update(id, payload);
  }
  return await getAdById(id);
};

export const deleteAd = async (id: string) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  const result = await adRepo.delete(id);
  return result.affected !== 0;
};

export const incrementAdViews = async (id: string) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  await adRepo.increment({ id }, "view_count", 1);
};