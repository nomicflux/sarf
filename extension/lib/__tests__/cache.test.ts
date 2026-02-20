import { describe, it, expect, vi } from 'vitest';
import { createCache } from '../cache';

describe('createCache', () => {
  it('stores and retrieves values', () => {
    const cache = createCache<string>(10, 60000);
    cache.set('a', 'hello');
    expect(cache.get('a')).toBe('hello');
  });

  it('returns null for missing keys', () => {
    const cache = createCache<string>(10, 60000);
    expect(cache.get('missing')).toBeNull();
  });

  it('evicts oldest when full', () => {
    const cache = createCache<string>(2, 60000);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    expect(cache.get('a')).toBeNull();
    expect(cache.get('c')).toBe('3');
  });

  it('expires entries after TTL', () => {
    vi.useFakeTimers();
    const cache = createCache<string>(10, 1000);
    cache.set('a', 'hello');
    vi.advanceTimersByTime(1001);
    expect(cache.get('a')).toBeNull();
    vi.useRealTimers();
  });

  it('clears all entries', () => {
    const cache = createCache<string>(10, 60000);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('a')).toBeNull();
  });
});
