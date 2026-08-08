// src/utils/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";
import { wsTransport } from "./wsTransport";

const isServer = typeof window === "undefined";

let storage: any;

if (isServer) {
  // SSR/Node.js — no storage, no localStorage
  storage = {
    getItem: (_key: string) => Promise.resolve(null),
    setItem: (_key: string, _value: string) => Promise.resolve(),
    removeItem: (_key: string) => Promise.resolve(),
  };
} else if (Platform.OS === "web") {
  storage = {
    getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key: string, value: string) =>
      Promise.resolve(localStorage.setItem(key, value)),
    removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
  };
} else {
  const AsyncStorage =
    require("@react-native-async-storage/async-storage").default;
  const SecureStore = require("expo-secure-store");
  storage = {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) =>
      SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
}

export const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder-co.supabase.co";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || "placeholder-key";

if (
  !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  !process.env.EXPO_PUBLIC_SUPABASE_KEY
) {
  console.warn(
    "Warning: Missing Supabase environment variables. Using placeholder values.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage,
    autoRefreshToken: !isServer, // ← disable timer on SSR
    persistSession: !isServer, // ← no session on SSR
    detectSessionInUrl: !isServer && Platform.OS === "web",
    flowType: Platform.OS === "web" ? "pkce" : "implicit",
  },
  // realtime: {
  //   transport: (isServer ? ws : WebSocket) as any,
  //   params: { eventsPerSecond: 10 },
  // },
  realtime: {
    ...(wsTransport && { transport: wsTransport as any }),
    params: { eventsPerSecond: 10 },
  },
});
