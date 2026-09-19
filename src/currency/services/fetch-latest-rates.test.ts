import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as envConfig from '@app/config/env';

import { fetchLatestRates } from './fetch-latest-rates';

describe('fetchLatestRates', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns null if API key is missing', async () => {
    vi.spyOn(envConfig, 'getEnv').mockReturnValue({
      currencyFreaksApiKey: undefined,
    } as any);

    const result = await fetchLatestRates(['EUR', 'PLN']);
    expect(result).toBeNull();
  });

  it('returns null if symbols array is empty', async () => {
    vi.spyOn(envConfig, 'getEnv').mockReturnValue({
      currencyFreaksApiKey: 'test-key',
    } as any);

    const result = await fetchLatestRates([]);
    expect(result).toBeNull();
  });

  it('fetches and returns rates successfully', async () => {
    vi.spyOn(envConfig, 'getEnv').mockReturnValue({
      currencyFreaksApiKey: 'test-key',
    } as any);

    const mockPayload = {
      date: '2026-03-01 10:00:00+00',
      base: 'USD',
      rates: {
        PLN: '4.00',
        EUR: '0.90',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    } as any);

    const result = await fetchLatestRates(['EUR', 'PLN']);
    expect(result).toEqual(mockPayload);
  });

  it('returns null on fetch failure or invalid payload structure', async () => {
    vi.spyOn(envConfig, 'getEnv').mockReturnValue({
      currencyFreaksApiKey: 'test-key',
    } as any);

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    } as any);

    const result = await fetchLatestRates(['EUR']);
    expect(result).toBeNull();
  });
});
