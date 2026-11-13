import { useInformationQuery } from "@/features/information/_hooks/useInformationQuery";
import { useUser } from "@/shared/contexts/UserContext";
import { useCallback, useState } from "react";

export function useAccount() {
  const { user: contextUser, setUser: setContextUser } = useUser();
  const {
    user: queryUser,
    isLoading: loadingQuery,
    isRefetching: refreshing,
    refetch,
  } = useInformationQuery(contextUser?.id);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const user = queryUser || contextUser;

  const onRefresh = useCallback(async () => {
    const res = await refetch();
    if (res.data) {
      setContextUser(res.data);
    }
  }, [refetch, setContextUser]);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  return {
    user,
    setUser: setContextUser,
    loading: loadingQuery && !user,
    refreshing,
    onRefresh,
    logoutModalVisible,
    setLogoutModalVisible,
    handleLogout,
  };
}
