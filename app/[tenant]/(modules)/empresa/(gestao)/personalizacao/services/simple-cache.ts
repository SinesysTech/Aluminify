/**
 * Simple Cache Implementation
 *
 * A lightweight cache generic class that uses Map for storage with TTL support.
 * Does not implement aggressive LRU to keep complexity low, relying on reasonable TTLs.
 */
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; expires: number }>();

  /**
   * Get value from cache
   * Returns null if not found or expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    // Check if exists
    if (!entry) {
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set value in cache with TTL
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set(key: string, data: T, ttl = 300000) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  /**
   * Invalidate specific key
   */
  invalidate(key: string) {
    this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
  }
}
