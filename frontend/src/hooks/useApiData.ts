import { useCallback, useEffect, useState } from "react";

interface ApiDataState<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  reload: () => void;
}

interface ApiDataOptions {
  cacheKey?: string;
  staleMs?: number;
  staleIfErrorMs?: number;
}

interface CacheEntry<T> {
  data: T;
  freshUntil: number;
  staleUntil: number;
}

const DEFAULT_STALE_IF_ERROR_MS = 30 * 60 * 1000;
const STORAGE_PREFIX = "spendsense-api-cache:";
const apiDataCache = new Map<string, CacheEntry<unknown>>();

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Đã xảy ra lỗi không xác định.";
}

/**
 * Load data from an async loader, exposing loading/error state and a reload().
 * The loader is invoked on mount and whenever `deps` change.
 */
export function useApiData<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
  options: ApiDataOptions = {},
): ApiDataState<T> {
  const cached = getCachedData<T>(options.cacheKey, true);
  const [data, setData] = useState<T | null>(cached?.data ?? null);
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    const cachedResult = getCachedData<T>(options.cacheKey, true);
    if (cachedResult?.isFresh && nonce === 0) {
      return () => {
        cancelled = true;
      };
    }

    setLoading(!cachedResult?.data && !data);
    setRefreshing(true);
    setError(null);
    loader()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setCachedData(options.cacheKey, result, options.staleMs, options.staleIfErrorMs);
      })
      .catch((err) => {
        if (cancelled) return;
        const fallback = getCachedData<T>(options.cacheKey, true);
        if (fallback?.data) {
          setData(fallback.data);
          setError(null);
          return;
        }
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, options.cacheKey]);

  return { data, loading, refreshing, error, reload };
}

function getCachedData<T>(cacheKey?: string, allowStale = false): { data: T; isFresh: boolean } | null {
  if (!cacheKey) return null;
  const entry = readCacheEntry<T>(cacheKey);
  if (!entry) return null;
  const now = Date.now();
  if (entry.staleUntil <= now) {
    deleteCacheEntry(cacheKey);
    return null;
  }
  const isFresh = entry.freshUntil > now;
  if (!allowStale && !isFresh) return null;
  return { data: entry.data, isFresh };
}

function setCachedData<T>(
  cacheKey: string | undefined,
  data: T,
  staleMs = 120_000,
  staleIfErrorMs = DEFAULT_STALE_IF_ERROR_MS,
): void {
  if (!cacheKey) return;
  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    freshUntil: now + staleMs,
    staleUntil: now + Math.max(staleMs, staleIfErrorMs),
  };
  apiDataCache.set(cacheKey, entry);
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${cacheKey}`, JSON.stringify(entry));
  } catch {
    // Session storage is a best-effort UX cache.
  }
}

function readCacheEntry<T>(cacheKey: string): CacheEntry<T> | null {
  const memoryEntry = apiDataCache.get(cacheKey) as CacheEntry<T> | undefined;
  if (memoryEntry) return memoryEntry;
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${cacheKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed.freshUntil !== "number" || typeof parsed.staleUntil !== "number") {
      return null;
    }
    apiDataCache.set(cacheKey, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function deleteCacheEntry(cacheKey: string): void {
  apiDataCache.delete(cacheKey);
  try {
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${cacheKey}`);
  } catch {
    // Ignore cache cleanup failures.
  }
}
