interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export function createCache<T>(maxSize: number, ttlMs: number) {
  const store = new Map<string, CacheEntry<T>>();

  function get(key: string): T | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > ttlMs) {
      store.delete(key);
      return null;
    }
    return entry.value;
  }

  function set(key: string, value: T): void {
    if (store.size >= maxSize) evictOldest();
    store.set(key, { value, timestamp: Date.now() });
  }

  function evictOldest(): void {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }

  function clear(): void {
    store.clear();
  }

  return { get, set, clear, size: () => store.size };
}
