import { AppDataSource } from "../db/index";
import { User } from "../domains/user";
import { Ad } from "../domains/ad";
import { Comment } from "../domains/comment";
import { Rating } from "../domains/rating";

export const getAllUsers = async () => {
  const userRepo = AppDataSource.getRepository(User);
  return await userRepo.find({
    select: { id: true, name: true, email: true, avatar: true, rating: true, is_donor: true }
  });
};

export const getUserById = async (id: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id } });
  
  if (!user) return null;

  // Verifica se o VIP expirou
  if (user.is_donor && user.donor_expiry && new Date(user.donor_expiry) < new Date()) {
    user.is_donor = false;
    await userRepo.update(id, { is_donor: false, donor_expiry: null as any });
  }

  const adRepo = AppDataSource.getRepository(Ad);
  const userAds = await adRepo.find({ where: { user: { id } } });

  const commentRepo = AppDataSource.getRepository(Comment);
  const comments = await commentRepo.find({ 
    where: { profile_user: { id } },
    relations: { author_user: true } 
  });

  const { password_hash, ...safeUser } = user;

  return {
    ...safeUser,
    activeAdsCount: userAds.filter(ad => !ad.is_sold).length,
    ads: userAds,
    reviews: comments.map(c => ({
      id: c.id,
      authorName: c.author_user.name,
      comment: c.content,
      createdAt: c.created_at
    }))
  };
};

export const addComment = async (profileUserId: string, authorUserId: string, content: string) => {
  const commentRepo = AppDataSource.getRepository(Comment);
  const newComment = commentRepo.create({
    profile_user: { id: profileUserId },
    author_user: { id: authorUserId },
    content
  });
  return await commentRepo.save(newComment);
};

export const addRating = async (profileUserId: string, authorUserId: string, score: number) => {
  const ratingRepo = AppDataSource.getRepository(Rating);
  const userRepo = AppDataSource.getRepository(User);

  // Tenta achar se já existe uma avaliação desse autor para esse perfil
  let rating = await ratingRepo.findOne({
    where: { profile_user: { id: profileUserId }, author_user: { id: authorUserId } }
  });

  if (rating) {
    rating.score = score;
    await ratingRepo.save(rating);
  } else {
    const newRating = ratingRepo.create({
      profile_user: { id: profileUserId },
      author_user: { id: authorUserId },
      score
    });
    await ratingRepo.save(newRating);
  }

  // Recalcula a média
  const allRatings = await ratingRepo.find({ where: { profile_user: { id: profileUserId } } });
  const totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
  const avgRating = totalScore / allRatings.length;

  await userRepo.update(profileUserId, { 
    rating: avgRating, 
    reviews_count: allRatings.length 
  });

  return { avgRating, reviewsCount: allRatings.length };
};