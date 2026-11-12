/**
 * Case-insensitive admin or owner role check.
 * Returns true if the user's role includes "admin" or "owner".
 */
export function hasAdminOrOwnerRole(role: any): boolean {
  if (!role) return false;
  const match = (r: any) => {
    const val = String(r).trim().toLowerCase();
    return val === "admin" || val === "owner";
  };
  if (Array.isArray(role)) {
    return role.some(match);
  }
  if (typeof role === "string") {
    const trimmed = role.trim().toLowerCase();
    if (trimmed === "admin" || trimmed === "owner") return true;
    try {
      const parsed = JSON.parse(role);
      if (Array.isArray(parsed)) {
        return parsed.some(match);
      }
    } catch (e) {}
  }
  return false;
}

/**
 * Case-insensitive owner role check.
 */
export function isOwnerRole(role: any): boolean {
  if (!role) return false;
  const match = (r: any) => String(r).trim().toLowerCase() === "owner";
  if (Array.isArray(role)) {
    return role.some(match);
  }
  if (typeof role === "string") {
    const trimmed = role.trim().toLowerCase();
    if (trimmed === "owner") return true;
    try {
      const parsed = JSON.parse(role);
      if (Array.isArray(parsed)) {
        return parsed.some(match);
      }
    } catch (e) {}
  }
  return false;
}

/**
 * Case-insensitive admin role check.
 * Supports string arrays (e.g. ["staff", "admin"]), plain strings ("admin"),
 * or JSON-stringified arrays ('["staff", "admin"]').
 */
export function hasAdminRole(role: any): boolean {
  if (!role) return false;
  if (Array.isArray(role)) {
    return role.some((r) => String(r).trim().toLowerCase() === "admin");
  }
  if (typeof role === "string") {
    const trimmed = role.trim().toLowerCase();
    if (trimmed === "admin") return true;
    try {
      const parsed = JSON.parse(role);
      if (Array.isArray(parsed)) {
        return parsed.some((r) => String(r).trim().toLowerCase() === "admin");
      }
    } catch (e) {}
  }
  return false;
}

/**
 * Case-insensitive leave role check.
 * Checks if the role includes "leave" (e.g. ["leave"], "leave", or '["leave"]').
 */
export function isLeaveRole(role: any): boolean {
  if (!role) return false;
  if (Array.isArray(role)) {
    return role.some((r) => String(r).trim().toLowerCase() === "leave");
  }
  if (typeof role === "string") {
    const trimmed = role.trim().toLowerCase();
    if (trimmed === "leave") return true;
    try {
      const parsed = JSON.parse(role);
      if (Array.isArray(parsed)) {
        return parsed.some((r) => String(r).trim().toLowerCase() === "leave");
      }
    } catch (e) {}
  }
  return false;
}

/**
 * Formats a user role value into uppercase display text (e.g. "ADMIN, STAFF" or "—").
 */
export function formatRole(role: any): string {
  if (!role) return "—";
  if (Array.isArray(role))
    return role.map((r) => String(r).toUpperCase()).join(", ");
  if (typeof role === "string") return role.toUpperCase();
  return String(role).toUpperCase();
}

/**
 * Normalizes a role value into a clean lowercase string array (e.g. ["staff", "admin"]).
 * Preserves the exact role stored in the database without hardcoded overrides.
 */
export function formatRolesList(role: any): string[] {
  if (!role) return [];
  let rawList: string[] = [];
  if (Array.isArray(role)) {
    rawList = role.map((r) => String(r).toLowerCase().trim());
  } else if (typeof role === "string") {
    try {
      const parsed = JSON.parse(role);
      if (Array.isArray(parsed)) {
        rawList = parsed.map((r) => String(r).toLowerCase().trim());
      } else {
        rawList = [role.toLowerCase().trim()];
      }
    } catch (e) {
      rawList = [role.toLowerCase().trim()];
    }
  } else {
    rawList = [String(role).toLowerCase().trim()];
  }

  // Preserve exact role string (user, staff, admin, member, owner, etc.)
  const cleanList = Array.from(new Set(rawList.filter(Boolean)));
  return cleanList.length > 0 ? cleanList : ["staff"];
}
