// Native implementation of WebSocket transport for Supabase Realtime
const g: any = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
export const wsTransport = g.WebSocket ? g.WebSocket : undefined;
