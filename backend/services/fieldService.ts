import { AppDataSource } from "../db/index";
import { In } from "typeorm";
import { Field } from "../domains/field";
import { parsePagination, buildPage } from "../utils/pagination";

const formatField = (field: Field | null) => {
  if (!field) return field;
  const { owners, base_price, rental_price, ...rest } = field as any;
  const safeOwners = (owners || []).map((o: any) => {
    const { password_hash, email, ...clean } = o;
    return clean;
  });

  return {
    ...rest,
    base_price: base_price != null ? Number(base_price) : 0,
    rental_price: rental_price != null ? Number(rental_price) : 0,
    owners: safeOwners,
    owner_ids: safeOwners.map((o: any) => o.id),
    owner_names: safeOwners.map((o: any) => o.name),
  };
};

export const getAllFields = async (filters: any = {}) => {
  const repo = AppDataSource.getRepository<Field>("Field");
  const { page, limit, skip } = parsePagination(filters);

  const idQb = repo.createQueryBuilder("field").select("field.id").orderBy("field.created_at", "DESC");

  if (filters?.search) {
    const q = `%${String(filters.search).toLowerCase().trim()}%`;
    idQb.andWhere("(LOWER(field.name) LIKE :q OR LOWER(field.location) LIKE :q)", { q });
  }
  if (filters?.ownerFilter === "unowned") {
    idQb.andWhere(`NOT EXISTS (SELECT 1 FROM field_owners fo WHERE fo."fieldsId" = field.id)`);
  } else if (filters?.ownerFilter === "owned") {
    idQb.andWhere(`EXISTS (SELECT 1 FROM field_owners fo WHERE fo."fieldsId" = field.id)`);
  }

  const total = await idQb.getCount();
  const idRows = await idQb.skip(skip).take(limit).getMany();
  const ids = idRows.map((r) => r.id);

  if (ids.length === 0) return buildPage([], total, page, limit);

  const fields = await repo.find({ where: { id: In(ids) }, relations: { owners: true } });
  const byId = new Map(fields.map((f) => [f.id, f]));
  const ordered = ids.map((id) => byId.get(id)!).filter(Boolean);

  return buildPage(ordered.map(formatField), total, page, limit);
};

export const getFieldStats = async () => {
  const repo = AppDataSource.getRepository<Field>("Field");
  const [total, unowned] = await Promise.all([
    repo.count(),
    repo
      .createQueryBuilder("field")
      .where(`NOT EXISTS (SELECT 1 FROM field_owners fo WHERE fo."fieldsId" = field.id)`)
      .getCount(),
  ]);
  return { total, unowned };
};

export const getFieldById = async (id: string) => {
  const repo = AppDataSource.getRepository<Field>("Field");
  const field = await repo.findOne({
    where: { id },
    relations: { owners: true },
  });
  return formatField(field);
};

export const getFieldsByOwner = async (ownerId: string) => {
  const repo = AppDataSource.getRepository<Field>("Field");
  const all = await repo.find({
    relations: { owners: true },
    order: { created_at: "DESC" },
  });
  return all
    .filter((f) => (f.owners || []).some((o) => o.id === ownerId))
    .map(formatField);
};

export const countOwnedFields = async (ownerId: string) => {
  const repo = AppDataSource.getRepository<Field>("Field");
  const all = await repo.find({ relations: { owners: true } });
  return all.filter((f) => (f.owners || []).some((o) => o.id === ownerId)).length;
};

const parseOwnerIds = (raw: any): string[] => {
  if (raw === undefined || raw === null) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  const s = String(raw).trim();
  if (!s) return [];
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
  }
  return s.split(",").map((x) => x.trim()).filter(Boolean);
};

const FIELD_WRITABLE_FIELDS = [
  "name", "description", "location", "type", "base_price", "rental_price",
  "whatsapp", "cover", "images", "rules", "infrastructure",
] as const;

const normalizeInput = (data: any) => {
  const out: any = {};
  for (const k of FIELD_WRITABLE_FIELDS) {
    if (data[k] !== undefined) out[k] = data[k];
  }

  ["base_price", "rental_price"].forEach((k) => {
    if (out[k] !== undefined && out[k] !== null && out[k] !== "") out[k] = Number(out[k]);
  });

  ["rules", "infrastructure", "images"].forEach((k) => {
    if (out[k] === undefined) return;
    if (Array.isArray(out[k])) return;
    if (typeof out[k] === "string") {
      const trimmed = out[k].trim();
      if (!trimmed) { out[k] = []; return; }
      try {
        const parsed = JSON.parse(trimmed);
        out[k] = Array.isArray(parsed) ? parsed : [trimmed];
      } catch {
        out[k] = trimmed.split("\n").map((s: string) => s.trim()).filter(Boolean);
      }
    }
  });

  if (data.owner_ids !== undefined) {
    const ids = Array.from(new Set(parseOwnerIds(data.owner_ids)));
    out.owners = ids.map((id) => ({ id }));
  }

  return out;
};

export const createField = async (data: any) => {
  const repo = AppDataSource.getRepository<Field>("Field");
  const payload = normalizeInput(data);
  if (payload.owners === undefined) payload.owners = [];
  const field = repo.create(payload) as unknown as Field;
  await repo.save(field);
  return await getFieldById(field.id);
};

export const updateField = async (id: string, data: any) => {
  const repo = AppDataSource.getRepository<Field>("Field");
  const payload = normalizeInput(data);
  if (payload.images && payload.images.length === 0) delete payload.images;

  const owners = payload.owners;
  delete payload.owners;

  if (Object.keys(payload).length > 0) {
    await repo.update(id, payload);
  }

  if (owners !== undefined) {
    const field = await repo.findOne({ where: { id }, relations: { owners: true } });
    if (field) {
      field.owners = owners;
      await repo.save(field);
    }
  }

  return await getFieldById(id);
};

export const deleteField = async (id: string) => {
  const repo = AppDataSource.getRepository<Field>("Field");
  const result = await repo.delete(id);
  return result.affected !== 0;
};

export const getRawField = async (id: string) => {
  const repo = AppDataSource.getRepository<Field>("Field");
  return await repo.findOne({ where: { id }, relations: { owners: true } });
};
