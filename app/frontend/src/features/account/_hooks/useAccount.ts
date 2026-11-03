import { useUser } from "@/contexts/UserContext";
import { StaffUser, userService } from "@/services/userService";
import { useCallback, useEffect, useState } from "react";
import { fetchAccountProfileApi } from "../_api/accountApi";

export function useAccount() {
  const { setUser: setContextUser } = useUser();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Initialize from storage
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
      const data = await fetchAccountProfileApi(current.id);
      if (data) {
        await userService.save(data);
        setUser(data);
        setContextUser(data);
      }
    } finally {
      setRefreshing(false);
    }
  }, [setContextUser]);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  return {
    user,
    setUser,
    loading,
    refreshing,
    onRefresh,
    logoutModalVisible,
    setLogoutModalVisible,
    handleLogout,
  };
}
