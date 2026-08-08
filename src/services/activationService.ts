// services/activationService.ts
import { supabase, supabaseUrl } from "@/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVATION_KEY = "activation_status";
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour — avoids a network call on every launch
const OFFSET_KEY = "server_time_offset";

let timeOffset = 0; // offset in ms: ServerTime - LocalTime
let isOffsetLoaded = false;

interface CachedActivation {
  isActive: boolean;
  end_date: string | null;
  checked_at: number;
}

export const activationService = {
  async getServerTime(): Promise<Date> {
    if (!supabaseUrl) return new Date();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout

      const response = await fetch(supabaseUrl, {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const dateStr = response.headers.get("date");
      if (dateStr) {
        const serverTime = new Date(dateStr);
        timeOffset = serverTime.getTime() - Date.now();
        isOffsetLoaded = true;
        await AsyncStorage.setItem(OFFSET_KEY, timeOffset.toString()).catch(
          () => {},
        );
        return serverTime;
      }
    } catch (e) {
      console.warn(
        "Failed to fetch server time, using local/cached offset:",
        e,
      );
    }

    if (!isOffsetLoaded) {
      try {
        const storedOffset = await AsyncStorage.getItem(OFFSET_KEY);
        if (storedOffset) {
          timeOffset = parseInt(storedOffset, 10) || 0;
          isOffsetLoaded = true;
        }
      } catch (err) {
        // Ignore
      }
    }

    return new Date(Date.now() + timeOffset);
  },

  async getRealTime(): Promise<Date> {
    if (!isOffsetLoaded) {
      try {
        const storedOffset = await AsyncStorage.getItem(OFFSET_KEY);
        if (storedOffset) {
          timeOffset = parseInt(storedOffset, 10) || 0;
          isOffsetLoaded = true;
        }
      } catch (err) {
        // Ignore
      }
    }
    return new Date(Date.now() + timeOffset);
  },

  getRealTimeNow(): Date {
    return new Date(Date.now() + timeOffset);
  },

  async checkActivation(
    system_id: string,
    forceRefresh = false,
  ): Promise<boolean> {
    const realTime = await this.getServerTime();

    if (!forceRefresh) {
      const cached = await this.getCached();
      if (cached && realTime.getTime() - cached.checked_at < CACHE_TTL_MS) {
        return cached.isActive;
      }
    }

    const today = realTime.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("pos_activation")
      .select("id, end_date")
      .eq("system_id", system_id)
      .lte("start_date", today)
      .gte("end_date", today)
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    let isActive = false;
    let endDate = data?.end_date ?? null;

    if (error) {
      console.warn("Supabase query error in checkActivation:", error);
      // Fallback to cache if database is unreachable (e.g. offline)
      const cached = await this.getCached();
      if (cached) {
        if (cached.end_date) {
          const endDateTime = new Date(cached.end_date).getTime();
          isActive = realTime.getTime() <= endDateTime;
          endDate = cached.end_date;
        } else {
          isActive = cached.isActive;
        }
      }
    } else {
      isActive = !error && !!data;
      await AsyncStorage.setItem(
        ACTIVATION_KEY,
        JSON.stringify({
          isActive,
          end_date: endDate,
          checked_at: realTime.getTime(),
        } as CachedActivation),
      );
    }

    return isActive;
  },

  async getCached(): Promise<CachedActivation | null> {
    const raw = await AsyncStorage.getItem(ACTIVATION_KEY);
    return raw ? (JSON.parse(raw) as CachedActivation) : null;
  },

  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(ACTIVATION_KEY);
  },

  async getActivationDetails(systemId: string) {
    const { data, error } = await supabase
      .from("pos_activation")
      .select("id, plan, start_date, end_date, created_at")
      .eq("system_id", systemId)
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch activation:", error);
      return null;
    }
    return data;
  },

  subscribeToActivation(
    system_id: string,
    onChange: (isActive: boolean) => void,
  ): () => void {
    const channelName = `pos_activation_${system_id}`;
    const existing = supabase
      .getChannels()
      .find((ch) => ch.topic === `realtime:${channelName}`);
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
          table: "pos_activation",
          filter: `system_id=eq.${system_id}`,
        },
        async () => {
          // Row inserted/updated/deleted for this system -> re-verify against DB
          const isActive = await this.checkActivation(system_id, true);
          onChange(isActive);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
