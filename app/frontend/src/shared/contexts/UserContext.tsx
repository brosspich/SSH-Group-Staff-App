import {
  extractSystemKey,
  fetchOfficialAttendanceConfig,
} from "@/shared/constants/attendanceConfig";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLoginStore } from "@/features/login/_store/useLoginStore";
import { apiClient } from "@/shared/services/api";
import { StaffUser, userService } from "@/shared/services/userService";
import { queryClient } from "@/shared/services/api/queryClient";
import { queryKeys } from "@/shared/services/api/queryKeys";
import { syncDeviceSession } from "@/utils/deviceSession";
import { isLeaveRole } from "@/utils/roleUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createContext, useContext, useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const USER_PERSIST_KEY = "ssh_user_zustand_store";

export interface CompanyInfo {
  id: string;
  name: string;
  companyName: string;
  company_name?: string;
  qrCodes?: string[];
  qrCode?: string[];
  "qr-code"?: string[];
  location?: string[];
  locationLinks?: string[];
  location_links?: string[];
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  radius_meters?: number;
  telegramBotToken?: string;
  telegram_bot_token?: string;
  telegramChatId?: string;
  telegram_chat_id?: string;
  timeIn?: string;
  "time-in"?: string;
  timeOut?: string;
  "time-out"?: string;
}

// -------------------------------------------------------------
// 1. ZUSTAND PERSISTENT STORE (Client State & Fast Disk Cache)
// -------------------------------------------------------------
interface UserStoreState {
  user: StaffUser | null;
  company: CompanyInfo | null;
  loading: boolean;
  ready: boolean;
}

interface UserStoreActions {
  setUser: (user: StaffUser | null) => void;
  setCompany: (company: CompanyInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setReady: (ready: boolean) => void;
  clearStore: () => void;
}

export type UserStore = UserStoreState & UserStoreActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      loading: true,
      ready: false,

      setUser: (user) => set({ user }),
      setCompany: (company) => set({ company }),
      setLoading: (loading) => set({ loading }),
      setReady: (ready) => set({ ready }),
      clearStore: () =>
        set({
          user: null,
          company: null,
          loading: false,
          ready: true,
        }),
    }),
    {
      name: USER_PERSIST_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        company: state.company,
      }),
    },
  ),
);

// -------------------------------------------------------------
// 2. USER CONTEXT VALUE INTERFACE
// -------------------------------------------------------------
interface UserContextValue {
  user: StaffUser | null;
  company: CompanyInfo | null;
  loading: boolean;
  setUser: (u: StaffUser | null) => void;
  setCompany: (c: CompanyInfo | null) => void;
  refresh: (forceNetwork?: boolean) => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  company: null,
  loading: true,
  setUser: () => {},
  setCompany: () => {},
  refresh: async () => {},
});

// -------------------------------------------------------------
// 3. USER PROVIDER WITH ZUSTAND + TANSTACK QUERY CACHING
// -------------------------------------------------------------
export function UserProvider({ children }: { children: React.ReactNode }) {
  const user = useUserStore((state) => state.user);
  const company = useUserStore((state) => state.company);
  const loading = useUserStore((state) => state.loading);
  const ready = useUserStore((state) => state.ready);

  const setUser = useUserStore((state) => state.setUser);
  const setCompany = useUserStore((state) => state.setCompany);
  const setLoading = useUserStore((state) => state.setLoading);
  const setReady = useUserStore((state) => state.setReady);
  const clearStore = useUserStore((state) => state.clearStore);

  const updateUser = (u: StaffUser | null) => {
    setUser(u);
    if (u) {
      userService.save(u);
      useAuthStore.getState().setSession(u as any, "");
      // TanStack Query Cache Hydration
      queryClient.setQueryData(queryKeys.staff.detail(u.id), u);
      queryClient.setQueryData(queryKeys.auth.me, u);
    } else {
      userService.clear();
      useAuthStore.getState().clearSession();
      clearStore();
      // TanStack Query Cache Invalidation
      queryClient.removeQueries({ queryKey: queryKeys.staff.all });
      queryClient.removeQueries({ queryKey: queryKeys.auth.me });
    }
  };

  const updateCompany = (c: CompanyInfo | null) => {
    setCompany(c);
    if (c) {
      // TanStack Query Company Cache
      const sysKey = extractSystemKey(String(c.id || "")).toLowerCase();
      queryClient.setQueryData(queryKeys.company.config(sysKey), [c]);
    }
  };

  /**
   * Refreshes user & company data utilizing TanStack Query for network
   * deduplication/caching (staleTime 5m) and Zustand for local state persistence.
   */
  const refresh = async (forceNetwork: boolean = false) => {
    try {
      // 1. Always prioritize reading fresh user from userService disk storage
      const diskUser = await userService.get().catch(() => null);
      if (!diskUser && !user) {
        return;
      }
      const localUser = diskUser || user;
      if (diskUser && (!user || user.id !== diskUser.id)) {
        setUser(diskUser);
        useAuthStore.getState().setSession(diskUser as any, "");
      }

      const rawSysId = localUser?.system_id || (localUser as any)?.systemId;
      const sysKey = rawSysId
        ? extractSystemKey(String(rawSysId)).toLowerCase()
        : undefined;

      // 2. Fetch fresh user & company via TanStack Query (5-minute cache deduplication)
      const [dbUser, companyRows] = await Promise.all([
        localUser?.id
          ? queryClient
              .fetchQuery({
                queryKey: queryKeys.staff.detail(localUser.id),
                queryFn: () =>
                  apiClient.get<StaffUser>(`/users-query/${localUser.id}`, {
                    timeout: 10000,
                  }),
                staleTime: forceNetwork ? 0 : 1000 * 60 * 5, // 5 minutes cache
              })
              .catch(() => null)
          : Promise.resolve(null),

        queryClient
          .fetchQuery({
            queryKey: queryKeys.company.config(sysKey),
            queryFn: () =>
              apiClient.get<CompanyInfo[]>("/company-query", {
                params: sysKey ? { id: sysKey } : undefined,
                timeout: 10000,
              }),
            staleTime: forceNetwork ? 0 : 1000 * 60 * 5, // 5 minutes cache
          })
          .catch(() => null),
      ]);

      // 3. Process & Cache Company Data
      if (companyRows && Array.isArray(companyRows) && companyRows.length > 0) {
        let activeCompany: CompanyInfo | undefined;
        if (sysKey) {
          activeCompany = companyRows.find(
            (c) =>
              extractSystemKey(String(c.id || "")).toLowerCase() === sysKey ||
              String(c.id).toLowerCase() === sysKey,
          );
        }
        if (!activeCompany) {
          activeCompany = companyRows[0];
        }

        if (activeCompany) {
          setCompany(activeCompany);
        }
      }

      // 4. Background Sync of Official Attendance Config
      fetchOfficialAttendanceConfig(forceNetwork, rawSysId).catch((err) =>
        console.warn("fetchOfficialAttendanceConfig sync warning:", err),
      );

      // 5. Process Fresh User Data & Device Session Terminate Check
      if (dbUser) {
        if (isLeaveRole(dbUser.role)) {
          // On leave -> Force logout
          await userService.clear();
          clearStore();
          queryClient.clear();
          useLoginStore.getState().resetForm();
          try {
            router.replace("/login/login");
          } catch {}
          return;
        }

        const sessionId = await AsyncStorage.getItem("pos_device_session_id");
        let devicesList: any[] = [];
        if (Array.isArray(dbUser.devices)) {
          devicesList = dbUser.devices;
        } else if (dbUser.devices && typeof dbUser.devices === "object") {
          devicesList = [dbUser.devices];
        } else if (typeof dbUser.devices === "string") {
          try {
            const parsed = JSON.parse(dbUser.devices);
            if (Array.isArray(parsed)) {
              devicesList = parsed;
            } else if (parsed && typeof parsed === "object") {
              devicesList = [parsed];
            }
          } catch {}
        }

        if (sessionId && devicesList.length > 0) {
          const currentSessionObj = devicesList.find(
            (d: any) => d.id === sessionId,
          );
          const isTerminated =
            currentSessionObj &&
            (currentSessionObj.terminate === true ||
              currentSessionObj.terminate === "true");

          if (isTerminated) {
            // Terminated by another device -> Force logout
            await userService.clear();
            clearStore();
            queryClient.clear();
            useLoginStore.getState().resetForm();
            try {
              router.replace("/login/login");
            } catch {}
            return;
          }
        }

        const updatedUser = dbUser as StaffUser;
        await userService.save(updatedUser);
        setUser(updatedUser);
        useAuthStore.getState().setSession(updatedUser as any, "");
        queryClient.setQueryData(
          queryKeys.staff.detail(updatedUser.id),
          updatedUser,
        );
      }
    } catch (e) {
      console.warn("Failed to refresh user and company:", e);
    } finally {
      setLoading(false);
      setReady(true);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Periodic heartbeat (every 10 seconds)
  useEffect(() => {
    if (!ready || (!user?.id && !user?.system_id)) return;

    const targetUserId = user.system_id || user.id;
    syncDeviceSession(targetUserId, true).catch((e) =>
      console.warn("Initial heartbeat sync failed:", e),
    );

    const interval = setInterval(() => {
      refresh(false); // background refresh reads from cache if within 5m
    }, 10000);

    return () => clearInterval(interval);
  }, [ready, user?.id]);

  return (
    <UserContext.Provider
      value={{
        user,
        company,
        loading,
        setUser: updateUser,
        setCompany: updateCompany,
        refresh,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
