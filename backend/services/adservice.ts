import { AppDataSource } from "../db/index";
import { Ad } from "../domains/ad";

export const getAllAds = async (filters: any) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad"); // <-- Blindado!

  const ads = await adRepo.find({
    where: { is_sold: false },
    relations: { user: true },
    order: {
      user: { is_donor: "DESC" },
      created_at: "DESC"
    }
  });

  if (filters?.category) {
    return ads.filter(a => a.category === filters.category || a.type === filters.category);
  }
  return ads;
};

export const getAdById = async (id: string) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  return await adRepo.findOne({
    where: { id },
    relations: { user: true }
  });
};

export const createAd = async (userId: string, adData: any) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  const newAd = adRepo.create({
    ...adData,
    user: { id: userId }
  });
  return await adRepo.save(newAd);
};

export const updateAd = async (id: string, adData: any) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  await adRepo.update(id, adData);
  return await getAdById(id);
};

export const deleteAd = async (id: string) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  const result = await adRepo.delete(id);
  return result.affected !== 0;
};

export const markAdAsSold = async (id: string) => {
  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  await adRepo.update(id, { is_sold: true });
  return await getAdById(id);
};