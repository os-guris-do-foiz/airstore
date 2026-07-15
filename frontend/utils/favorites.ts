import { useSyncExternalStore, useCallback, useEffect } from "react";
import { favoritesApi } from "../api/favorites";
import { isLoggedIn } from "./auth";

let ids: Set<string> = new Set();
let loaded = false;
let loading = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

const load = async () => {
  if (loaded || loading || !isLoggedIn()) return;
  loading = true;
  try {
    ids = new Set(await favoritesApi.getIds());
    loaded = true;
    emit();
  } catch {
  } finally {
    loading = false;
  }
};

export const favoritesStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  getSnapshot() {
    return ids;
  },
  ensureLoaded: load,
  reset() {
    ids = new Set();
    loaded = false;
    emit();
  },
  async toggle(id: string): Promise<boolean> {
    const was = ids.has(id);
    const optimistic = new Set(ids);
    was ? optimistic.delete(id) : optimistic.add(id);
    ids = optimistic;
    emit();
    try {
      const res = await favoritesApi.toggle(id);
      const synced = new Set(ids);
      res.favorited ? synced.add(id) : synced.delete(id);
      ids = synced;
      emit();
      return res.favorited;
    } catch (e) {
      const reverted = new Set(ids);
      was ? reverted.add(id) : reverted.delete(id);
      ids = reverted;
      emit();
      throw e;
    }
  },
};

export function useFavorites() {
  const snapshot = useSyncExternalStore(favoritesStore.subscribe, favoritesStore.getSnapshot, favoritesStore.getSnapshot);
  useEffect(() => {
    favoritesStore.ensureLoaded();
  }, []);
  const isFavorited = useCallback((id: string) => snapshot.has(id), [snapshot]);
  const toggle = useCallback((id: string) => favoritesStore.toggle(id), []);
  return { isFavorited, toggle, favoriteIds: snapshot };
}
