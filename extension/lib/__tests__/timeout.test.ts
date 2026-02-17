import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withTimeout } from '../timeout';

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves when promise completes before timeout', async () => {
    const fastPromise = Promise.resolve('success');
    const result = await withTimeout(fastPromise, 1000);
    expect(result).toBe('success');
  });

  it('rejects with timeout error when promise is too slow', async () => {
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 5000);
    });

    const timeoutPromise = withTimeout(slowPromise, 1000);
    vi.advanceTimersByTime(1000);

    await expect(timeoutPromise).rejects.toThrow('timeout');
  });
});
