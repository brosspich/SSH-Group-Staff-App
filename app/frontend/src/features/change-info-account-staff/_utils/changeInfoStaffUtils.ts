import { extractSystemKey } from "@/constants/attendanceConfig";
import type { StaffUser } from "@/services/userService";
import { formatRolesList, isOwnerRole } from "@/utils/roleUtils";
import type { StaffStatusFilter } from "../_types/changeInfoStaff.types";

export function filterStaffDirectory(
  staffList: StaffUser[],
  currentUser: StaffUser | null,
  searchQuery: string,
  selectedSystemFilter: string,
  statusFilter: StaffStatusFilter,
): StaffUser[] {
  const isOwner = isOwnerRole(currentUser?.role);
  const currentAdminSystem = extractSystemKey(currentUser?.system_id);

  return staffList.filter((staff) => {
    // 1. System isolation:
    // If not owner, admin can ONLY view staff in their own system key
    const staffSys = extractSystemKey(staff.system_id);
    if (!isOwner && staffSys !== currentAdminSystem) {
      return false;
    }

    // If owner and a specific system filter is selected
    if (
      isOwner &&
      selectedSystemFilter !== "all" &&
      staffSys !== selectedSystemFilter
    ) {
      return false;
    }

    // 2. Status filter
    if (statusFilter === "active" && staff.is_active === false) return false;
    if (statusFilter === "inactive" && staff.is_active !== false) return false;
    if (statusFilter === "admin") {
      const roles = formatRolesList(staff.role);
      if (!roles.includes("admin") && !roles.includes("owner")) return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const nameMatch = (staff.name || "").toLowerCase().includes(query);
      const usernameMatch = (staff.username || "")
        .toLowerCase()
        .includes(query);
      const idMatch = (staff.id || "").toLowerCase().includes(query);
      const posMatch = (staff.position || "").toLowerCase().includes(query);
      const sysMatch = (staff.system_id || "").toLowerCase().includes(query);

      if (!nameMatch && !usernameMatch && !idMatch && !posMatch && !sysMatch) {
        return false;
      }
    }

    return true;
  });
}
