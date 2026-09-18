// High performance in-memory TTL cache with automatic expiration
class MemoryCache {
  constructor(defaultTtlMs = 120000) { // Default 2 minutes
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  del(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Helper to invalidate all keys matching prefix
  invalidatePrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new MemoryCache(180000); // 3 minutes cache for static query catalogs
