// Web/SSR
const isServer = typeof window === "undefined";
export const wsTransport = isServer ? require("ws") : undefined;
