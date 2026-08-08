// Web implementation of WebSocket transport for Supabase Realtime
export const wsTransport = typeof window !== "undefined" ? window.WebSocket : undefined;
