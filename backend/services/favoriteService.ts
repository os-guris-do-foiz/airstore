import { AppDataSource } from "../db/index";
import { Favorite } from "../domains/favorite";
import { Ad } from "../domains/ad";
import { parsePagination, buildPage } from "../utils/pagination";
import { isActiveDonor } from "../utils/donor";

const favoriteRepo = () => AppDataSource.getRepository<Favorite>("Favorite");

const formatAd = (ad: Ad | null) => {
  if (!ad) return ad;
  const { user, price, ...rest } = ad as any;
  const safeUser = user ? (({ password_hash, email, ...clean }) => clean)(user) : null;
  return {
    ...rest,
    price: price != null ? Number(price) : price,
    user_id: user?.id ?? null,
    is_donor: isActiveDonor(user),
    user: safeUser,
  };
};

export const toggleFavorite = async (userId: string, adId: string): Promise<{ favorited: boolean }> => {
  const repo = favoriteRepo();
  const existing = await repo.findOne({ where: { user: { id: userId }, ad: { id: adId } } });
  if (existing) {
    await repo.delete(existing.id);
    return { favorited: false };
  }
  const adExists = await AppDataSource.getRepository<Ad>("Ad").findOne({ where: { id: adId }, select: { id: true } });
  if (!adExists) throw new Error("Anúncio não encontrado.");
  await repo.save(repo.create({ user: { id: userId }, ad: { id: adId } }) as unknown as Favorite);
  return { favorited: true };
};

export const getFavoriteAdIds = async (userId: string): Promise<string[]> => {
  const rows = await favoriteRepo().find({
    where: { user: { id: userId } },
    relations: { ad: true },
    order: { created_at: "DESC" },
  });
  return rows.map((r) => r.ad?.id).filter(Boolean) as string[];
};

export const getFavoriteAds = async (userId: string, page?: number, limit?: number) => {
  const { page: p, limit: l, skip } = parsePagination({ page, limit });
  const [rows, total] = await favoriteRepo().findAndCount({
    where: { user: { id: userId } },
    relations: { ad: { user: true } },
    order: { created_at: "DESC" },
    skip,
    take: l,
  });
  const ads = rows.map((r) => r.ad).filter(Boolean).map(formatAd);
  return buildPage(ads, total, p, l);
};
