export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  roles?: string[];
  avatar?: string | null;
  is_donor?: boolean;
}

export function getCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem("fronteira_user");
    if (!raw) return null;
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function getRoles(): string[] {
  return getCurrentUser()?.roles || [];
}

export function hasRole(role: string): boolean {
  return getRoles().includes(role);
}

export function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem("fronteira_token"));
}

export async function refreshCurrentUser(): Promise<{ user: CurrentUser | null; changed: boolean; sessionInvalid?: boolean }> {
  if (!isLoggedIn()) return { user: null, changed: false };
  try {
    const { authApi } = await import("../api/auth");
    const fresh = await authApi.me();
    const prev = getCurrentUser();
    const merged = { ...(prev || {}), ...fresh };
    localStorage.setItem("fronteira_user", JSON.stringify(merged));
    const changed = JSON.stringify(prev?.roles || []) !== JSON.stringify(fresh.roles || []);
    return { user: merged, changed };
  } catch (err: any) {
    if (err?.status === 401 || err?.status === 403) {
      localStorage.removeItem("fronteira_user");
      localStorage.removeItem("fronteira_token");
      return { user: null, changed: false, sessionInvalid: true };
    }
    return { user: getCurrentUser(), changed: false };
  }
}
