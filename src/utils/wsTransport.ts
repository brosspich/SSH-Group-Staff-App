// Implementation of WebSocket transport for Supabase Realtime (Web & Node SSR)
let transport: any = undefined;

if (typeof window !== "undefined" && window.WebSocket) {
  transport = window.WebSocket;
} else if (typeof globalThis !== "undefined" && (globalThis as any).WebSocket) {
  transport = (globalThis as any).WebSocket;
} else {
  try {
    transport = require("ws");
  } catch (e) {
    transport = undefined;
  }
}

export const wsTransport = transport;
