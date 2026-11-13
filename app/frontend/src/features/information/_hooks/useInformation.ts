import { useUser } from "@/shared/contexts/UserContext";
import type { StaffUser } from "@/shared/services/userService";
import { useCallback, useState } from "react";
import type { FieldKey } from "../_types/information.types";
import { useInformationQuery } from "./useInformationQuery";

export function useInformation() {
  const { user: contextUser, setUser: setContextUser } = useUser();
  const {
    user: queryUser,
    isLoading: loadingQuery,
    isRefetching: refreshing,
    refetch,
  } = useInformationQuery(contextUser?.id);

  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const user = queryUser || contextUser;

  // Pull-to-refresh: TanStack Query refetch
  const onRefresh = useCallback(async () => {
    const res = await refetch();
    if (res.data) {
      setContextUser(res.data);
    }
  }, [refetch, setContextUser]);

  const handleFieldSaved = (updated: StaffUser) => {
    setContextUser(updated);
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  return {
    user,
    setUser: setContextUser,
    loading: loadingQuery && !user,
    refreshing,
    onRefresh,
    editingField,
    setEditingField,
    handleFieldSaved,
    logoutModalVisible,
    setLogoutModalVisible,
    handleLogout,
  };
}
