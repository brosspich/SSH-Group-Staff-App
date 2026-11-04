import { useUser } from "@/contexts/UserContext";
import { StaffUser, userService } from "@/services/userService";
import { useCallback, useEffect, useState } from "react";
import { fetchAccountProfileApi } from "../_api/accountApi";

export function useAccount() {
  const { user: contextUser, setUser: setContextUser } = useUser();
  const [user, setUser] = useState<StaffUser | null>(contextUser);
  const [loading, setLoading] = useState(!contextUser);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Sync state whenever active context user changes (e.g. account switch)
  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      setLoading(false);
    } else {
      userService.get().then((u) => {
        if (u) {
          setUser(u);
          setLoading(false);
        }
      });
    }
  }, [contextUser]);

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
