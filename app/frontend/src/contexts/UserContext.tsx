import { fetchOfficialAttendanceQRCodes } from "@/constants/attendanceConfig";
import { useAuthStore } from "@/features/auth/store/authStore";
import { apiClient } from "@/services/api";
import { StaffUser, userService } from "@/services/userService";
import { queryClient } from "@/shared/services/api/queryClient";
import { queryKeys } from "@/shared/services/api/queryKeys";
import { syncDeviceSession } from "@/utils/deviceSession";
import { isLeaveRole } from "@/utils/roleUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

interface UserContextValue {
  user: StaffUser | null;
  loading: boolean;
  setUser: (u: StaffUser | null) => void;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  setUser: () => {},
  refresh: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const updateUser = (u: StaffUser | null) => {
    setUser(u);
    if (u) {
      userService.save(u);
      useAuthStore.getState().setSession(u as any, "");
      queryClient.setQueryData(queryKeys.staff.detail(u.id), u);
    } else {
      userService.clear();
      useAuthStore.getState().clearSession();
      queryClient.removeQueries({ queryKey: ["staff"] });
    }
  };

  const refresh = async () => {
    try {
      // 1. Get user profile from local storage
      const u = await userService.get();
      if (u) {
        setUser(u);
        useAuthStore.getState().setSession(u as any, "");
        queryClient.setQueryData(queryKeys.staff.detail(u.id), u);
      } else {
        setUser(null);
      }

      // 2. Fetch official attendance QR codes in background via backend
      fetchOfficialAttendanceQRCodes().catch((err) =>
        console.warn("fetchOfficialAttendanceQRCodes warning:", err),
      );

      if (u?.id) {
        // Fetch the user row from Backend API to check if our local session was terminated
        const dbUser = await apiClient
          .get<StaffUser>(`/users-query/${u.id}`)
          .catch(() => null);

        if (dbUser) {
          if (isLeaveRole(dbUser.role)) {
            // User account is on leave! Force logout.
            await userService.clear();
            setUser(null);
            setLoading(false);
            setReady(true);
            try {
              router.replace("/login/login");
            } catch (e) {}
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
            } catch (e) {
              console.warn("Failed to parse devices list:", e);
            }
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
              // Our session was explicitly terminated! Force logout.
              await userService.clear();
              setUser(null);
              setLoading(false);
              setReady(true);
              try {
                router.replace("/login/login");
              } catch (e) {}
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
      }
    } catch (e) {
      console.warn("Failed to refresh user:", e);
    } finally {
      setLoading(false);
      setReady(true);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Periodic heartbeat (every 10 seconds) to refresh user status, update last_active,
  // and immediately trigger auto-logout if session was terminated by another device
  useEffect(() => {
    if (!ready || !user?.id) return;

    syncDeviceSession(user.id, true).catch((e) =>
      console.warn("Initial heartbeat sync failed:", e),
    );

    const interval = setInterval(() => {
      refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [ready, user?.id]);

  return (
    <UserContext.Provider
      value={{ user, loading, setUser: updateUser, refresh }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
