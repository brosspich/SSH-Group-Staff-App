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
