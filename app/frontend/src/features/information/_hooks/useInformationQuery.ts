import { queryKeys } from "@/shared/services/api/queryKeys";
import { StaffUser, userService } from "@/shared/services/userService";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchUserByIdApi } from "../_api/informationApi";
import { useInformationStore } from "../_store/useInformationStore";

export function useInformationQuery(userId?: string) {
  const setUser = useInformationStore((state) => state.setUser);
  const setError = useInformationStore((state) => state.setError);
  const cachedUser = useInformationStore((state) => state.user);

  const query = useQuery<StaffUser | null>({
    queryKey: queryKeys.staff.detail(userId || "current"),
    queryFn: async () => {
      let targetId = userId;
      if (!targetId) {
        const u = await userService.get();
        targetId = u?.id;
      }
      if (!targetId) return null;
      const remote = await fetchUserByIdApi(targetId);
      if (remote) {
        await userService.save(remote);
      }
      return remote;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
    initialData: cachedUser,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    } else if (query.error) {
      setError(
        query.error instanceof Error
          ? query.error.message
          : "Failed to load user info",
      );
    }
  }, [query.data, query.error, setUser, setError]);

  return {
    ...query,
    user: query.data || cachedUser,
  };
}
