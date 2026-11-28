export const PERMISSIONS = [
  {
    key: "volunteer_approvals",
    label: "Volunteer approvals",
    description: "Review volunteer registrations, view contact details, and approve or reject accounts.",
  },
  {
    key: "operation_management",
    label: "Operation management",
    description: "Create, edit, cancel, complete, and manage volunteer sign-up lists.",
  },
  {
    key: "attendance_confirmation",
    label: "Attendance confirmation",
    description: "Generate duty codes and confirm or record volunteer attendance.",
  },
  {
    key: "community_publishing",
    label: "Community publishing",
    description: "Create, publish, and archive announcements, advisories, and emergency alerts.",
  },
  {
    key: "reports_exports",
    label: "Reports & exports",
    description: "View operational reports and export volunteer rosters.",
  },
  {
    key: "activity_logs",
    label: "Activity logs",
    description: "Inspect the immutable administrative audit trail.",
  },
];

export const ALL_PERMISSION_KEYS = PERMISSIONS.map((item) => item.key);

export const RBAC_PRESETS = [
  {
    id: "operations_manager",
    label: "Operations Manager",
    role: "admin",
    permissions: ["volunteer_approvals", "operation_management", "attendance_confirmation"],
  },
  {
    id: "content_officer",
    label: "Content Officer",
    role: "admin",
    permissions: ["community_publishing"],
  },
  {
    id: "auditor",
    label: "Auditor",
    role: "admin",
    permissions: ["reports_exports", "activity_logs"],
  },
  {
    id: "super_administrator",
    label: "Super Administrator",
    role: "superadmin",
    permissions: [...ALL_PERMISSION_KEYS],
  },
  {
    id: "custom",
    label: "Custom permissions",
    role: "admin",
    permissions: null,
  },
];

export const ROUTE_PERMISSIONS = {
  "/dashboard": null,
  "/no-access": null,
  "/volunteers": "volunteer_approvals",
  "/operations": "operation_management",
  "/attendance": "attendance_confirmation",
  "/community": "community_publishing",
  "/reports": "reports_exports",
  "/activity-logs": "activity_logs",
  "/rbac": "superadmin_only",
};

export function hasPermission(user, permission) {
  if (!user || user.is_active === false) return false;
  if (!permission) return true;
  if (user.role === "superadmin") return true;
  if (permission === "superadmin_only") return false;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
}

export function canAccessRoute(user, pathname) {
  if (!user) return false;
  if (pathname === "/no-access" || pathname === "/dashboard") return true;
  const required = ROUTE_PERMISSIONS[pathname];
  if (required === undefined || required === null) return true;
  return hasPermission(user, required);
}

export function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function validatePassword(password) {
  const value = String(password || "");
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return "Password must contain at least one letter and one number.";
  }
  return "";
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function calculateAge(birthdate) {
  if (!birthdate) return null;
  const dob = new Date(birthdate);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export function formatAvailability(availability) {
  const map = {
    available: "Available",
    unavailable: "Unavailable",
    on_operation: "On Operation",
  };
  return map[availability] || availability || "—";
}
