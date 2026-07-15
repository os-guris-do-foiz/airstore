import { AppDataSource } from "../db/index";
import { MoreThan } from "typeorm";
import { User } from "../domains/user";
import { Ad } from "../domains/ad";
import { Comment } from "../domains/comment";
import { Rating } from "../domains/rating";
import { getFeaturedTeamSummary } from "./teamService";
import { parsePagination, buildPage } from "../utils/pagination";
import { isActiveDonor } from "../utils/donor";

export type UserFilter = "FIELD_OWNER" | "PREMIUM" | "ADMIN" | "BANNED" | "ACTIVE";
const VALID_FILTERS: UserFilter[] = ["FIELD_OWNER", "PREMIUM", "ADMIN", "BANNED", "ACTIVE"];

export const getAllUsers = async (search?: string, page?: number, limit?: number, filter?: string) => {
  const userRepo = AppDataSource.getRepository<User>("User");
  const { page: p, limit: l, skip } = parsePagination({ page, limit });

  const qb = userRepo.createQueryBuilder("u").orderBy("u.created_at", "DESC");

  if (search && search.trim()) {
    const s = search.trim();
    if (s.startsWith("#")) {
      qb.andWhere("LOWER(u.id) LIKE :idq", { idq: `%${s.slice(1).toLowerCase()}%` });
    } else {
      const q = s.toLowerCase();
      qb.andWhere(
        "(LOWER(u.name) LIKE :q OR LOWER(u.nickname) LIKE :q OR LOWER(u.email) LIKE :q OR LOWER(u.id) = :qExact)",
        { q: `%${q}%`, qExact: q }
      );
    }
  }

  if (filter && VALID_FILTERS.includes(filter as UserFilter)) {
    if (filter === "BANNED" || filter === "ACTIVE") {
      qb.andWhere("u.status = :status", { status: filter });
    } else {
      qb.andWhere(":role = ANY(u.roles)", { role: filter });
    }
  }

  const [users, total] = await qb.skip(skip).take(l).getManyAndCount();

  const items = users.map(user => {
    const { password_hash, ...safeUser } = user;
    return {
      ...safeUser,
      roles: safeUser.roles || ['USER'],
      status: safeUser.status || 'ACTIVE',
      is_donor: isActiveDonor(user),
    };
  });

  return buildPage(items, total, p, l);
};

export const getUserStats = async () => {
  const userRepo = AppDataSource.getRepository<User>("User");
  const [total, fieldOwners, premium, admins, banned, active] = await Promise.all([
    userRepo.count(),
    userRepo.createQueryBuilder("u").where(":role = ANY(u.roles)", { role: "FIELD_OWNER" }).getCount(),
    userRepo.createQueryBuilder("u").where(":role = ANY(u.roles)", { role: "PREMIUM" }).getCount(),
    userRepo.createQueryBuilder("u").where(":role = ANY(u.roles)", { role: "ADMIN" }).getCount(),
    userRepo.count({ where: { status: "BANNED" } }),
    userRepo.count({ where: { status: "ACTIVE" } }),
  ]);
  return { total, fieldOwners, premium, admins, banned, active };
};

export const getUserById = async (id: string) => {
  const userRepo = AppDataSource.getRepository<User>("User");
  const user = await userRepo.findOne({ where: { id } });
  
  if (!user) return null;

  if (user.is_donor && user.donor_expiry && new Date(user.donor_expiry) < new Date()) {
    user.is_donor = false;
    await userRepo.update(id, { is_donor: false, donor_expiry: null as any });
  }

  const adRepo = AppDataSource.getRepository<Ad>("Ad");
  const activeAdsCount = await adRepo.count({ where: { user: { id }, is_sold: false } });

  const commentRepo = AppDataSource.getRepository<Comment>("Comment");
  const comments = await commentRepo.find({
    where: { profile_user: { id } },
    relations: { author_user: true },
    order: { created_at: "DESC" }
  });

  const ratingRepo = AppDataSource.getRepository<Rating>("Rating");
  const ratings = await ratingRepo.find({
    where: { profile_user: { id } },
    relations: { author_user: true }
  });
  const scoreByAuthor = new Map(ratings.map(r => [r.author_user.id, r.score]));

  const { password_hash, ...safeUser } = user;

  const featured_team = await getFeaturedTeamSummary(id);

  return {
    ...safeUser,
    roles: safeUser.roles || ['USER'],
    status: safeUser.status || 'ACTIVE',
    is_donor: isActiveDonor(user),
    featured_team,
    activeAdsCount,
    reviews: comments.map(c => ({
      id: c.id,
      author_id: c.author_user.id,
      author_name: c.author_user.name,
      author_avatar: c.author_user.avatar ?? null,
      comment: c.content,
      rating: scoreByAuthor.get(c.author_user.id) ?? null,
      created_at: c.created_at
    }))
  };
};

export const addComment = async (profileUserId: string, authorUserId: string, content: string) => {
  const commentRepo = AppDataSource.getRepository<Comment>("Comment");
  const newComment = commentRepo.create({
    profile_user: { id: profileUserId },
    author_user: { id: authorUserId },
    content
  });
  return await commentRepo.save(newComment);
};

const recomputeRating = async (profileUserId: string) => {
  const ratingRepo = AppDataSource.getRepository<Rating>("Rating");
  const userRepo = AppDataSource.getRepository<User>("User");
  const all = await ratingRepo.find({ where: { profile_user: { id: profileUserId } } });
  const count = all.length;
  const avg = count ? all.reduce((s, r) => s + r.score, 0) / count : 0;
  await userRepo.update(profileUserId, { rating: avg, reviews_count: count });
  return { avgRating: avg, reviewsCount: count };
};

export const createReview = async (profileUserId: string, authorUserId: string, score: number, content: string) => {
  const commentRepo = AppDataSource.getRepository<Comment>("Comment");
  const ratingRepo = AppDataSource.getRepository<Rating>("Rating");

  const existing = await commentRepo.findOne({
    where: { profile_user: { id: profileUserId }, author_user: { id: authorUserId } }
  });
  if (existing) throw new Error("Você já avaliou este perfil. Edite a sua avaliação em vez de criar outra.");

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await commentRepo.findOne({
    where: { author_user: { id: authorUserId }, created_at: MoreThan(dayAgo) }
  });
  if (recent) throw new Error("Você só pode fazer uma avaliação por dia. Tente novamente amanhã.");

  await commentRepo.save(commentRepo.create({
    profile_user: { id: profileUserId },
    author_user: { id: authorUserId },
    content
  }));
  await ratingRepo.save(ratingRepo.create({
    profile_user: { id: profileUserId },
    author_user: { id: authorUserId },
    score
  }));

  return await recomputeRating(profileUserId);
};

export const editReview = async (profileUserId: string, authorUserId: string, score: number, content: string) => {
  const commentRepo = AppDataSource.getRepository<Comment>("Comment");
  const ratingRepo = AppDataSource.getRepository<Rating>("Rating");

  const comment = await commentRepo.findOne({
    where: { profile_user: { id: profileUserId }, author_user: { id: authorUserId } }
  });
  if (!comment) throw new Error("Avaliação não encontrada.");

  comment.content = content;
  await commentRepo.save(comment);

  const rating = await ratingRepo.findOne({
    where: { profile_user: { id: profileUserId }, author_user: { id: authorUserId } }
  });
  if (rating) {
    rating.score = score;
    await ratingRepo.save(rating);
  } else {
    await ratingRepo.save(ratingRepo.create({
      profile_user: { id: profileUserId },
      author_user: { id: authorUserId },
      score
    }));
  }

  return await recomputeRating(profileUserId);
};

export const deleteReview = async (reviewId: string, requesterId: string, isAdmin: boolean) => {
  const commentRepo = AppDataSource.getRepository<Comment>("Comment");
  const ratingRepo = AppDataSource.getRepository<Rating>("Rating");

  const comment = await commentRepo.findOne({
    where: { id: reviewId },
    relations: { author_user: true, profile_user: true }
  });
  if (!comment) throw new Error("Avaliação não encontrada.");

  const authorId = comment.author_user.id;
  const profileId = comment.profile_user.id;
  if (!isAdmin && authorId !== requesterId) {
    throw new Error("Você só pode apagar a sua própria avaliação.");
  }

  await commentRepo.delete(reviewId);
  const rating = await ratingRepo.findOne({
    where: { profile_user: { id: profileId }, author_user: { id: authorId } }
  });
  if (rating) await ratingRepo.delete(rating.id);

  await recomputeRating(profileId);
  return true;
};

const VALID_ROLES = ["USER", "FIELD_OWNER", "PREMIUM", "ADMIN"];

export const updateUserRoles = async (id: string, roles: string[], field_limit?: number) => {
  const userRepo = AppDataSource.getRepository<User>("User");

  const clean = Array.from(
    new Set((Array.isArray(roles) ? roles : []).filter((r) => VALID_ROLES.includes(r)))
  );
  if (!clean.includes("USER")) clean.push("USER");

  const is_donor = clean.includes("PREMIUM");

  const patch: any = { roles: clean, is_donor };
  if (field_limit !== undefined && field_limit !== null && !Number.isNaN(Number(field_limit))) {
    patch.field_limit = Math.max(0, Math.floor(Number(field_limit)));
  }

  await userRepo.update(id, patch);
  return true;
};

export const getFieldLimit = async (id: string) => {
  const userRepo = AppDataSource.getRepository<User>("User");
  const user = await userRepo.findOne({ where: { id } });
  return user?.field_limit ?? 0;
};

export const getUserAuth = async (id: string) => {
  const userRepo = AppDataSource.getRepository<User>("User");
  const user = await userRepo.findOne({ where: { id } });
  if (!user) return null;
  return { roles: user.roles || [], field_limit: user.field_limit ?? 0 };
};

export const updateProfile = async (id: string, data: any) => {
  const userRepo = AppDataSource.getRepository<User>("User");
  const patch: any = {};
  ["name", "nickname", "bio", "city", "avatar", "banner"].forEach((k) => {
    if (data[k] !== undefined) patch[k] = data[k];
  });
  if (Object.keys(patch).length > 0) {
    await userRepo.update(id, patch);
  }
  return await getUserById(id);
};

export const updateUserStatus = async (id: string, status: string) => {
  if (!["ACTIVE", "BANNED"].includes(status)) {
    throw new Error("Status inválido.");
  }
  const userRepo = AppDataSource.getRepository<User>("User");
  await userRepo.update(id, { status });
  return true;
};