import { useLanguage } from "@/features/language";
import {
  DynamicSystemItem,
  extractSystemKey,
  fetchAvailableCompanySystems,
} from "@/shared/constants/attendanceConfig";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { StaffUser, userService } from "@/shared/services/userService";
import { hasAdminOrOwnerRole, isOwnerRole } from "@/utils/roleUtils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStaffDirectoryStore } from "../_store/useStaffDirectoryStore";
import { filterStaffDirectory } from "../_utils/changeInfoStaffUtils";
import { useStaffDirectoryQuery } from "./useStaffDirectoryQuery";

export function useChangeInfoStaff() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // TanStack Query & Zustand Store
  const {
    data: queryStaff,
    isLoading: loadingStaffQuery,
    isRefetching: refreshingStaff,
    refetch,
  } = useStaffDirectoryQuery();

  const cachedStaffList = useStaffDirectoryStore((state) => state.staffList);
  const searchQuery = useStaffDirectoryStore((state) => state.searchQuery);
  const setSearchQuery = useStaffDirectoryStore(
    (state) => state.setSearchQuery,
  );
  const selectedSystemFilter = useStaffDirectoryStore(
    (state) => state.selectedSystemFilter,
  );
  const setSelectedSystemFilter = useStaffDirectoryStore(
    (state) => state.setSelectedSystemFilter,
  );
  const statusFilter = useStaffDirectoryStore((state) => state.statusFilter);
  const setStatusFilter = useStaffDirectoryStore(
    (state) => state.setStatusFilter,
  );
  const editingStaff = useStaffDirectoryStore((state) => state.editingStaff);
  const setEditingStaff = useStaffDirectoryStore(
    (state) => state.setEditingStaff,
  );

  const staffList = queryStaff || cachedStaffList;

  // Edit Modal State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const [availableSystems, setAvailableSystems] = useState<DynamicSystemItem[]>(
    [{ id: "system-0001" }, { id: "system-0002" }],
  );

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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
          if (selectedSystemFilter === "all" && !owner) {
            setSelectedSystemFilter(sys);
          }

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
  }, [selectedSystemFilter, setSelectedSystemFilter]);

  // Debounced search query (timing controlled centrally in useDebounce)
  const debouncedSearch = useDebounce(searchQuery);

  const filteredStaff = useMemo(() => {
    return filterStaffDirectory(
      staffList,
      currentUser,
      debouncedSearch,
      selectedSystemFilter,
      statusFilter,
    );
  }, [
    staffList,
    currentUser,
    debouncedSearch,
    selectedSystemFilter,
    statusFilter,
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleStaffSaved = (updatedStaff: StaffUser) => {
    if (currentUser?.id === updatedStaff.id) {
      setCurrentUser(updatedStaff);
    }
    showToast(t("changeInfoStaff.saveSuccess", "Staff updated successfully!"));
  };

  const isOwner = isOwnerRole(currentUser?.role);

  return {
    currentUser,
    checkingAuth,
    isAuthorized,
    isOwner,
    staffList,
    filteredStaff,
    loadingStaff: loadingStaffQuery && staffList.length === 0,
    refreshing: refreshingStaff,
    searchQuery,
    debouncedSearch,
    isSearching:
      searchQuery.trim().length > 0 && searchQuery !== debouncedSearch,
    setSearchQuery,
    selectedSystemFilter,
    setSelectedSystemFilter,
    statusFilter,
    setStatusFilter,
    availableSystems,
    editingStaff,
    setEditingStaff,
    toastMessage,
    onRefresh,
    handleStaffSaved,
  };
}
