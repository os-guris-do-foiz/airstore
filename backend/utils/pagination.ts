const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const parsePagination = (query: any) => {
  const page = Math.max(1, parseInt(query?.page, 10) || 1);
  const limitRaw = parseInt(query?.limit, 10) || DEFAULT_LIMIT;
  const limit = Math.min(MAX_LIMIT, Math.max(1, limitRaw));
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPage = <T>(items: T[], total: number, page: number, limit: number) => ({
  items,
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
