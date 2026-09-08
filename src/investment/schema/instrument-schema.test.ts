import { describe, expect, it } from 'vitest';

import {
  InvestmentInstrumentFilterQuerySchema,
  InvestmentInstrumentSchema,
  InvestmentInstrumentUpdateSchema,
} from './instrument-schema';

describe('investment instrument schema', () => {
  it('parses valid investment instrument', () => {
    expect(
      InvestmentInstrumentSchema.parse({
        name: 'VWCE ETF',
        kind: 'fund',
        currency: 'PLN',
      }),
    ).toEqual({
      name: 'VWCE ETF',
      kind: 'fund',
      currency: 'PLN',
    });
  });

  it('validates partial updates', () => {
    expect(
      InvestmentInstrumentUpdateSchema.parse({
        name: 'New Name',
      }),
    ).toEqual({
      name: 'New Name',
    });
  });

  it('validates filter query', () => {
    expect(
      InvestmentInstrumentFilterQuerySchema.parse({
        kind: 'share',
        currency: 'USD',
      }),
    ).toEqual({
      kind: 'share',
      currency: 'USD',
    });
  });
});
