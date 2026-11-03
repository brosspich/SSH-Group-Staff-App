import {
  DynamicSystemItem,
  extractSystemKey,
  fetchAvailableCompanySystems,
} from "@/constants/attendanceConfig";
import { StaffUser, userService } from "@/services/userService";
import { hasAdminOrOwnerRole, isOwnerRole } from "@/utils/roleUtils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchStaffDirectoryApi } from "../_api/changeInfoStaffApi";
import type { StaffStatusFilter } from "../_types/changeInfoStaff.types";
import { filterStaffDirectory } from "../_utils/changeInfoStaffUtils";

export function useChangeInfoStaff() {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Staff Data
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystemFilter, setSelectedSystemFilter] =
    useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StaffStatusFilter>("all");

  // Edit Modal State
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [availableSystems, setAvailableSystems] = useState<DynamicSystemItem[]>(
    [{ id: "system-0001" }, { id: "system-0002" }],
  );

  const fetchStaff = useCallback(async () => {
    setLoadingStaff(true);
    try {
      const data = await fetchStaffDirectoryApi();
      setStaffList(data);
    } catch (e) {
      console.warn("Error fetching staff list:", e);
    } finally {
      setLoadingStaff(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStaff();
  }, [fetchStaff]);

  // Auth check & initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await userService.get();
        if (!mounted) return;
        setCurrentUser(u);

        const authorized = hasAdminOrOwnerRole(u?.role);
        setIsAuthorized(authorized);

        if (authorized && u) {
          const sys = extractSystemKey(u.system_id);
          const owner = isOwnerRole(u.role);
          setSelectedSystemFilter(owner ? "all" : sys);
          await fetchStaff();

          if (owner) {
            const systems = await fetchAvailableCompanySystems();
            if (mounted && systems.length > 0) {
              setAvailableSystems(systems);
            }
          }
        }
      } catch (e) {
        console.warn("Failed checking user auth in change info:", e);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchStaff]);

  const filteredStaff = useMemo(() => {
    return filterStaffDirectory(
      staffList,
      currentUser,
      searchQuery,
      selectedSystemFilter,
      statusFilter,
    );
  }, [staffList, currentUser, searchQuery, selectedSystemFilter, statusFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleStaffSaved = (updatedStaff: StaffUser) => {
    if (currentUser?.id === updatedStaff.id) {
      setCurrentUser(updatedStaff);
    }
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === updatedStaff.id ? { ...s, ...updatedStaff } : s,
      ),
    );
    setEditingStaff(null);
    showToast(`Updated account for ${updatedStaff.name}`);
  };

  const isOwner = isOwnerRole(currentUser?.role);

  return {
    currentUser,
    checkingAuth,
    isAuthorized,
    isOwner,
    staffList,
    filteredStaff,
    loadingStaff,
    refreshing,
    onRefresh,
    searchQuery,
    setSearchQuery,
    selectedSystemFilter,
    setSelectedSystemFilter,
    statusFilter,
    setStatusFilter,
    editingStaff,
    setEditingStaff,
    toastMessage,
    availableSystems,
    handleStaffSaved,
  };
}
