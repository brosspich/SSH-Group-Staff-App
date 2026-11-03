import { useUser } from "@/contexts/UserContext";
import { StaffUser, userService } from "@/services/userService";
import { useCallback, useEffect, useState } from "react";
import { fetchUserByIdApi } from "../_api/informationApi";
import type { FieldKey } from "../_types/information.types";

export function useInformation() {
  const { setUser: setContextUser } = useUser();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Initialize from disk
  useEffect(() => {
    let mounted = true;
    userService.get().then((u) => {
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Pull-to-refresh: fetch latest profile from backend API
  const onRefresh = useCallback(async () => {
    const current = await userService.get();
    if (!current?.id) {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      const data = await fetchUserByIdApi(current.id);
      if (data) {
        await userService.save(data);
        setUser(data);
        setContextUser(data);
      }
    } finally {
      setRefreshing(false);
    }
  }, [setContextUser]);

  const handleFieldSaved = (updated: StaffUser) => {
    setUser(updated);
    setContextUser(updated);
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  return {
    user,
    setUser,
    loading,
    refreshing,
    onRefresh,
    editingField,
    setEditingField,
    logoutModalVisible,
    setLogoutModalVisible,
    handleFieldSaved,
    handleLogout,
  };
}
