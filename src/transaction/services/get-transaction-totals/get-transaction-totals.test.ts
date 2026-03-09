import { describe, expect, it, Mock, vi } from 'vitest';

import {
  findTransactionTotalsByCurrency,
  findTransactionTotalsOverall,
} from '@transaction/db';
import { randomObjectIdString } from '@utils/random';

import { getTransactionTotals } from './get-transaction-totals';
import {
  PARSED_TOTALS_BY_CURRENCY,
  PARSED_TOTALS_OVERALL,
  TOTALS_BY_CURRENCY,
  TOTALS_OVERALL,
} from './mocks';

import { FOOD_CATEGORY_ID_STR } from '@/testing/factories/category';

vi.mock('@transaction/db', () => ({
  findTransactionTotalsOverall: vi.fn(),
  findTransactionTotalsByCurrency: vi.fn(),
}));

describe('getTransactionTotals', () => {
  it('get transaction totals', async () => {
    (findTransactionTotalsByCurrency as Mock).mockResolvedValue(TOTALS_BY_CURRENCY);
    (findTransactionTotalsOverall as Mock).mockResolvedValue(TOTALS_OVERALL);

    const result = await getTransactionTotals(
      { categoryId: FOOD_CATEGORY_ID_STR },
      randomObjectIdString(),
    );

    expect(findTransactionTotalsByCurrency).toHaveBeenCalledOnce();
    expect(findTransactionTotalsOverall).toHaveBeenCalledOnce();
    expect(result).toEqual({
      overall: PARSED_TOTALS_OVERALL,
      byCurrency: PARSED_TOTALS_BY_CURRENCY,
    });
  });
});
