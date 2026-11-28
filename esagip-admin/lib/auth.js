import { hasPermission } from "@/lib/rbac";

const SESSION_STORAGE_KEY = "esagip_admin_session";

function normalizeUser(user) {
  if (!user || typeof user !== "object") return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status ?? "approved",
    is_active: user.is_active !== false,
    rejection_reason: user.rejection_reason ?? null,
    permissions: Array.isArray(user.permissions) ? [...user.permissions] : [],
  };
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.token) return null;
    return {
      token: String(parsed.token),
      user: normalizeUser(parsed.user),
    };
  } catch {
    return null;
  }
}

export function setSession(session) {
  if (typeof window === "undefined") return;
  try {
    if (!session || !session.token) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    const payload = {
      token: String(session.token),
      user: normalizeUser(session.user),
    };
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota / private mode failures
  }
}

export function updateSessionUser(user) {
  const current = getSession();
  if (!current) return;
  setSession({ token: current.token, user });
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function getToken() {
  return getSession()?.token || null;
}

export function isAdminUser(user) {
  return Boolean(
    user &&
      (user.role === "admin" || user.role === "superadmin") &&
      user.is_active !== false,
  );
}

export function can(permission, user = getSession()?.user || null) {
  return hasPermission(user, permission);
}

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === "function" ? handler : null;
}

export function notifyUnauthorized() {
  clearSession();
  if (unauthorizedHandler) {
    unauthorizedHandler();
  }
}
