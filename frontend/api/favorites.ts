import { api } from "./apiClient";
import { Ad, Paginated } from "../types";

export const favoritesApi = {
  list: (page = 1, limit = 20) =>
    api.get<Paginated<Ad>>("/favorites", { params: { page, limit } }),

  getIds: () => api.get<string[]>("/favorites/ids"),

  toggle: (adId: string) => api.post<{ favorited: boolean }>(`/favorites/${adId}/toggle`),
};
