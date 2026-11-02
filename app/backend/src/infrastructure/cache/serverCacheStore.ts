import { createStore } from "zustand/vanilla";

export interface CacheEntry<T = any> {
  data: T;
  expiresAt: number;
  table: string;
}

export interface ServerCacheState {
  entries: Map<string, CacheEntry>;
  get: <T = any>(key: string) => T | null;
  set: <T = any>(key: string, data: T, table: string, ttlMs?: number) => void;
  invalidateTable: (table: string) => void;
  invalidateKey: (key: string) => void;
  clear: () => void;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const serverCacheStore = createStore<ServerCacheState>((set, get) => ({
  entries: new Map<string, CacheEntry>(),

  get: <T = any>(key: string): T | null => {
    const entry = get().entries.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      get().entries.delete(key);
      return null;
    }

    return entry.data as T;
  },

  set: <T = any>(
    key: string,
    data: T,
    table: string,
    ttlMs: number = DEFAULT_TTL_MS,
  ) => {
    const expiresAt = Date.now() + ttlMs;
    get().entries.set(key, { data, expiresAt, table });
  },

  invalidateTable: (table: string) => {
    const normalizedTable = table.toLowerCase();
    const entries = get().entries;

    for (const [key, entry] of entries.entries()) {
      if (
        entry.table.toLowerCase() === normalizedTable ||
        (normalizedTable.includes("company") &&
          entry.table.toLowerCase().includes("company")) ||
        (normalizedTable.includes("attendance") &&
          entry.table.toLowerCase().includes("company")) ||
        (normalizedTable.includes("user") &&
          entry.table.toLowerCase().includes("user"))
      ) {
        entries.delete(key);
      }
    }
  },

  invalidateKey: (key: string) => {
    get().entries.delete(key);
  },

  clear: () => {
    get().entries.clear();
  },
}));

/**
 * Creates a deterministic cache key for database queries
 */
export function buildQueryCacheKey(
  table: string,
  action: string,
  params: {
    where?: any;
    select?: any;
    orderBy?: any;
    limit?: any;
    single?: boolean;
  },
): string {
  const sortedParams = JSON.stringify(params, Object.keys(params).sort());
  return `${table.toLowerCase()}:${action}:${sortedParams}`;
}
