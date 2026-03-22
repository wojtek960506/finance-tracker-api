import { afterEach, describe, expect, it, vi } from 'vitest';

describe('currency schema', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unmock('@currency/consts');
  });

  it('throws error when currencies list is empty', async () => {
    vi.doMock('@currency/consts', () => ({ currencies: [] }));

    await expect(import('./currency.schema')).rejects.toThrow(
      'Currencies list cannot be empty',
    );
  });

  it('parses valid currency values', async () => {
    vi.doMock('@currency/consts', () => ({
      currencies: [{ code: 'USD', name: 'US Dollar' }],
    }));

    const { CurrencyCodeSchema, CurrencySchema, CurrenciesSchema } = await import(
      './currency.schema'
    );

    expect(CurrencyCodeSchema.parse('USD')).toBe('USD');
    expect(CurrencySchema.parse({ code: 'USD', name: 'US Dollar' })).toEqual({
      code: 'USD',
      name: 'US Dollar',
    });
    expect(CurrenciesSchema.parse([{ code: 'USD', name: 'US Dollar' }])).toEqual([
      { code: 'USD', name: 'US Dollar' },
    ]);
  });
});
