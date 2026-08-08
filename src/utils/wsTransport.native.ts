// Native implementation of WebSocket transport for Supabase Realtime
export const wsTransport = typeof global !== "undefined" && (global as any).WebSocket ? (global as any).WebSocket : undefined;
