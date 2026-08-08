import { fetchOfficialAttendanceQRCodes } from "@/constants/attendanceConfig";
import { StaffUser, userService } from "@/services/userService";
import { syncDeviceSession } from "@/utils/deviceSession";
import { supabase } from "@/utils/supabase";
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
    } else {
      userService.clear();
      try {
        router.replace("/login/login");
      } catch (e) {}
    }
  };

  const refresh = async () => {
    try {
      // Fetch official attendance QR codes from Supabase FIRST on app open / session refresh
      await fetchOfficialAttendanceQRCodes();

      const u = await userService.get();
      if (u?.id) {
        // Fetch the user row from Supabase to check if our local session was terminated
        const { data: dbUser, error } = await supabase
          .from("ssh_group_staff_users")
          .select("*")
          .eq("id", u.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.warn("Failed to fetch user row in refresh:", error);
        }

        if (!error && dbUser) {
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

          // Trigger background device session sync asynchronously with isAppOpen=true
          syncDeviceSession(u.id, true).catch((e) =>
            console.warn("Background sync failed:", e),
          );

          const updatedUser = dbUser as StaffUser;
          await userService.save(updatedUser);
          setUser(updatedUser);
          setLoading(false);
          setReady(true);
          return;
        }
      }
      setUser(u);
    } catch (e) {
      console.error(
        "Error refreshing user context with device session sync:",
        e,
      );
    } finally {
      setLoading(false);
      setReady(true);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!ready || !user?.id) return;

    const channelName = `ssh_group_staff_users:${user.id}`;

    const existing = supabase
      .getChannels()
      .find((ch: any) => ch.topic === `realtime:${channelName}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ssh_group_staff_users",
          filter: `id=eq.${user.id}`,
        },
        async (payload: any) => {
          if (payload.eventType === "DELETE") {
            await userService.clear();
            setUser(null);
            try {
              router.replace("/login/login");
            } catch (e) {}
            return;
          }
          // Re-fetch the complete user row from Supabase to prevent partial data corruption
          const { data: dbUser } = await supabase
            .from("ssh_group_staff_users")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (!dbUser) return;

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
              console.warn(
                "Failed to parse devices list in realtime handler:",
                e,
              );
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
              // Forced logout because this session was terminated
              await userService.clear();
              setUser(null);
              try {
                router.replace("/login/login");
              } catch (e) {}
              return;
            }
          }

          const updatedUser = dbUser as StaffUser;
          await userService.save(updatedUser);
          setUser(updatedUser);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ready, user?.id]);

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
