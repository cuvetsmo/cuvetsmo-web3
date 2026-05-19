/**
 * Day-1 daily-quota tracking — localStorage based.
 *
 * Tracks per-address mint count in a rolling 24h window.
 * Will be replaced by Supabase server-side tracking before launch.
 */

const KEY = "cuvetsmo:play:mint:quota";
const WINDOW_MS = 24 * 60 * 60 * 1000;
export const DAILY_MINT_LIMIT = 10;

interface QuotaEntry {
  address: string;
  timestamps: number[];
}

interface QuotaStore {
  entries: QuotaEntry[];
}

function load(): QuotaStore {
  if (typeof window === "undefined") return { entries: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as QuotaStore;
    if (!parsed || !Array.isArray(parsed.entries)) return { entries: [] };
    return parsed;
  } catch {
    return { entries: [] };
  }
}

function save(store: QuotaStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // localStorage may be disabled/full — silent fallback (quota is best-effort)
  }
}

function recentTimestamps(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

export function getMintsToday(address: string): number {
  if (!address) return 0;
  const store = load();
  const entry = store.entries.find(
    (e) => e.address.toLowerCase() === address.toLowerCase(),
  );
  if (!entry) return 0;
  return recentTimestamps(entry.timestamps, Date.now()).length;
}

export function recordMint(address: string) {
  if (!address) return;
  const now = Date.now();
  const store = load();
  let entry = store.entries.find(
    (e) => e.address.toLowerCase() === address.toLowerCase(),
  );
  if (!entry) {
    entry = { address, timestamps: [] };
    store.entries.push(entry);
  }
  entry.timestamps = [...recentTimestamps(entry.timestamps, now), now];
  // Trim store: keep only entries with at least 1 recent timestamp
  store.entries = store.entries.filter((e) => e.timestamps.length > 0);
  save(store);
}

export function remainingMints(address: string): number {
  return Math.max(0, DAILY_MINT_LIMIT - getMintsToday(address));
}
