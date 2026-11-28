import mockAdminsSeed from "@/mock/admins.json";
import mockHealth from "@/mock/health.json";
import mockSkills from "@/mock/skills.json";
import mockVolunteersSeed from "@/mock/volunteers.json";
import {
  clearSession,
  getSession,
  getToken,
  notifyUnauthorized,
  setSession,
  updateSessionUser,
} from "@/lib/auth";
import { ALL_PERMISSION_KEYS, validatePassword } from "@/lib/rbac";

let mockVolunteers = mockVolunteersSeed.map((item) => ({ ...item, skills: [...item.skills] }));
let mockAdmins = mockAdminsSeed.map((item) => ({ ...item, permissions: [...item.permissions] }));

export class ApiError extends Error {
  constructor(message, { status = 0, errors = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function isMockMode() {
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
}

function getApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!apiUrl) {
    throw new ApiError("NEXT_PUBLIC_API_URL is not configured.", { status: 0 });
  }
  return apiUrl;
}

export function getStoredToken() {
  return getToken();
}

export function setStoredToken(token, user = null) {
  if (!token) {
    clearSession();
    return;
  }
  setSession({ token, user: user || getSession()?.user || null });
}

export function clearStoredToken() {
  clearSession();
}

function redirectToSignInOnUnauthorized() {
  notifyUnauthorized();
}

function getMockCurrentUser() {
  const session = getSession();
  if (!session?.token) return null;
  const id = session.user?.id;
  if (id !== undefined && id !== null) {
    return mockAdmins.find((a) => a.id === id) || null;
  }
  return mockAdmins[0] || null;
}

async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const apiUrl = getApiBaseUrl();
  const headers = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? `Unable to reach the API: ${error.message}` : "Unable to reach the API.",
      { status: 0 },
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      redirectToSignInOnUnauthorized();
    }
    const message = payload?.message || `Request failed with HTTP ${response.status}.`;
    throw new ApiError(message, {
      status: response.status,
      errors: response.status === 422 ? payload?.errors || null : null,
    });
  }

  return payload;
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.set(key, String(value).trim());
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function getHealth() {
  if (isMockMode()) {
    return mockHealth;
  }
  return apiRequest("/api/health", { auth: false });
}

export async function getSkills() {
  if (isMockMode()) {
    return { data: mockSkills, message: "OK" };
  }
  return apiRequest("/api/skills", { auth: false });
}

export async function adminLogin({ email, password }) {
  if (isMockMode()) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");
    const errors = {};
    if (!cleanEmail) errors.email = ["The email field is required."];
    if (!cleanPassword) errors.password = ["The password field is required."];
    if (Object.keys(errors).length) {
      throw new ApiError("The given data was invalid.", { status: 422, errors });
    }

    const account = mockAdmins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!account) {
      throw new ApiError("Invalid email or password.", { status: 401 });
    }
    if (!account.is_active) {
      throw new ApiError("This account has no access to the admin portal.", { status: 403 });
    }

    const token = `mock-token-${account.id}`;
    const user = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      status: "approved",
      is_active: account.is_active,
      rejection_reason: null,
      permissions: account.role === "superadmin" ? [...ALL_PERMISSION_KEYS] : [...account.permissions],
    };
    setSession({ token, user });
    return {
      data: { token, user },
      message: "Logged in.",
    };
  }

  const payload = await apiRequest("/api/admin/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  if (payload?.data?.token) {
    setSession({ token: payload.data.token, user: payload.data.user || null });
  }
  return payload;
}

export async function logout() {
  if (isMockMode()) {
    clearSession();
    return { data: null, message: "Logged out." };
  }
  try {
    return await apiRequest("/api/logout", { method: "POST" });
  } finally {
    clearSession();
  }
}

export async function getMe() {
  if (isMockMode()) {
    const account = getMockCurrentUser();
    if (!account) {
      redirectToSignInOnUnauthorized();
      throw new ApiError("Unauthenticated.", { status: 401 });
    }
    const user = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      status: "approved",
      is_active: account.is_active,
      rejection_reason: null,
      permissions: account.role === "superadmin" ? [...ALL_PERMISSION_KEYS] : [...account.permissions],
      profile: null,
    };
    updateSessionUser(user);
    return { data: user, message: "OK" };
  }

  const payload = await apiRequest("/api/me");
  if (payload?.data) {
    updateSessionUser(payload.data);
  }
  return payload;
}

export async function updateMe(updates) {
  if (isMockMode()) {
    const account = getMockCurrentUser();
    if (!account) throw new ApiError("Unauthenticated.", { status: 401 });
    if (updates?.name) account.name = updates.name;
    const me = await getMe();
    return { ...me, message: "Profile updated." };
  }
  const payload = await apiRequest("/api/me", { method: "PUT", body: updates });
  if (payload?.data) {
    updateSessionUser(payload.data);
  }
  return payload;
}

export async function getVolunteers(params = {}) {
  if (isMockMode()) {
    const {
      status,
      skill,
      availability,
      address_area: addressArea,
      search,
      page = 1,
      per_page: perPage = 10,
    } = params;

    let filtered = [...mockVolunteers];
    if (status) filtered = filtered.filter((v) => v.status === status);
    if (skill) filtered = filtered.filter((v) => v.skills.some((s) => String(s.id) === String(skill)));
    if (availability) filtered = filtered.filter((v) => v.availability === availability);
    if (addressArea) {
      const q = addressArea.toLowerCase();
      filtered = filtered.filter((v) => v.address_area.toLowerCase().includes(q));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q) ||
          v.contact_number.toLowerCase().includes(q),
      );
    }

    const safePerPage = Math.min(50, Math.max(1, Number(perPage) || 10));
    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / safePerPage));
    const safePage = Math.min(lastPage, Math.max(1, Number(page) || 1));
    const start = (safePage - 1) * safePerPage;

    return {
      data: filtered.slice(start, start + safePerPage),
      message: "OK",
      meta: { page: safePage, per_page: safePerPage, total, last_page: lastPage },
    };
  }

  return apiRequest(`/api/volunteers${buildQuery(params)}`);
}

export async function getVolunteersSummary() {
  if (isMockMode()) {
    return {
      data: {
        total: mockVolunteers.length,
        pending: mockVolunteers.filter((v) => v.status === "pending").length,
        approved: mockVolunteers.filter((v) => v.status === "approved").length,
        rejected: mockVolunteers.filter((v) => v.status === "rejected").length,
      },
      message: "OK",
    };
  }
  return apiRequest("/api/volunteers/summary");
}

export const getVolunteerSummary = getVolunteersSummary;

export async function approveVolunteer(id) {
  if (isMockMode()) {
    const volunteer = mockVolunteers.find((v) => String(v.id) === String(id));
    if (!volunteer) throw new ApiError("Not found.", { status: 404 });
    if (volunteer.status !== "pending") {
      throw new ApiError("Only pending volunteers can be approved.", {
        status: 422,
        errors: { status: [`Volunteer is already ${volunteer.status}.`] },
      });
    }
    const actor = getMockCurrentUser();
    volunteer.status = "approved";
    volunteer.rejection_reason = null;
    volunteer.approved_by = actor?.id || 1;
    volunteer.approved_at = new Date().toISOString();
    return { data: { ...volunteer }, message: "Volunteer approved." };
  }
  return apiRequest(`/api/volunteers/${id}/approve`, { method: "POST" });
}

export async function rejectVolunteer(id, reason = "") {
  if (isMockMode()) {
    const cleanReason = String(reason || "").trim();
    if (cleanReason.length > 255) {
      throw new ApiError("The given data was invalid.", {
        status: 422,
        errors: { reason: ["The reason field must not be greater than 255 characters."] },
      });
    }
    const volunteer = mockVolunteers.find((v) => String(v.id) === String(id));
    if (!volunteer) throw new ApiError("Not found.", { status: 404 });
    if (volunteer.status !== "pending") {
      throw new ApiError("Only pending volunteers can be rejected.", {
        status: 422,
        errors: { status: [`Volunteer is already ${volunteer.status}.`] },
      });
    }
    volunteer.status = "rejected";
    volunteer.rejection_reason = cleanReason || null;
    volunteer.approved_by = null;
    volunteer.approved_at = null;
    return { data: { ...volunteer }, message: "Volunteer rejected." };
  }

  const cleanReason = String(reason || "").trim();
  const body = cleanReason ? { reason: cleanReason } : {};
  return apiRequest(`/api/volunteers/${id}/reject`, { method: "POST", body });
}

export async function getAdmins(params = {}) {
  if (isMockMode()) {
    const { page = 1, per_page: perPage = 15 } = params;
    const safePerPage = Math.min(50, Math.max(1, Number(perPage) || 15));
    const total = mockAdmins.length;
    const lastPage = Math.max(1, Math.ceil(total / safePerPage));
    const safePage = Math.min(lastPage, Math.max(1, Number(page) || 1));
    const start = (safePage - 1) * safePerPage;
    return {
      data: mockAdmins.slice(start, start + safePerPage),
      message: "OK",
      meta: { page: safePage, per_page: safePerPage, total, last_page: lastPage },
    };
  }
  return apiRequest(`/api/admins${buildQuery(params)}`);
}

export async function createAdmin({ name, email, password, role = "admin", permissions = [] }) {
  if (isMockMode()) {
    const errors = {};
    if (!String(name || "").trim()) errors.name = ["The name field is required."];
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail) errors.email = ["The email field is required."];
    else if (mockAdmins.some((a) => a.email.toLowerCase() === cleanEmail)) {
      errors.email = ["The email has already been taken."];
    }
    const pwErr = validatePassword(password);
    if (pwErr) errors.password = [pwErr];
    if (!["admin", "superadmin"].includes(role)) {
      errors.role = ["The selected role is invalid."];
    }
    if (Object.keys(errors).length) {
      throw new ApiError("The given data was invalid.", { status: 422, errors });
    }

    const nextId = mockAdmins.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const created = {
      id: nextId,
      name: String(name).trim(),
      email: cleanEmail,
      role,
      is_active: true,
      permissions: role === "superadmin" ? [...ALL_PERMISSION_KEYS] : [...permissions],
      created_at: new Date().toISOString(),
    };
    mockAdmins = [created, ...mockAdmins];
    return { data: { ...created }, message: "Admin created." };
  }

  return apiRequest("/api/admins", {
    method: "POST",
    body: {
      name,
      email,
      password,
      role,
      permissions: role === "superadmin" ? ALL_PERMISSION_KEYS : permissions,
    },
  });
}

export async function updateAdmin(id, updates) {
  if (isMockMode()) {
    const admin = mockAdmins.find((a) => String(a.id) === String(id));
    if (!admin) throw new ApiError("Not found.", { status: 404 });
    if (updates.name !== undefined) admin.name = String(updates.name).trim();
    if (updates.role !== undefined) admin.role = updates.role;
    if (updates.is_active !== undefined) admin.is_active = Boolean(updates.is_active);
    if (updates.permissions !== undefined) {
      admin.permissions = admin.role === "superadmin" ? [...ALL_PERMISSION_KEYS] : [...updates.permissions];
    }
    return { data: { ...admin }, message: "Admin updated." };
  }
  return apiRequest(`/api/admins/${id}`, { method: "PUT", body: updates });
}
