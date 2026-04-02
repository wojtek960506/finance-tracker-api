import { describe, expect, it, Mock, vi } from 'vitest';

import { TransactionModel } from '@transaction/model';
import { TransactionStatisticsQuery } from '@transaction/schema';
import { randomObjectIdString } from '@utils/random';

import { getStatisticsGrouping } from './get-statistics-grouping';
import { getStatisticsMatching } from './get-statistics-matching';
import { getTransactionStatistics } from './get-transaction-statistics';
import { parseStatisticsResult } from './parse-statistics-result';

vi.mock(
  '@transaction/services/get-transaction-statistics/get-statistics-grouping',
  () => ({ getStatisticsGrouping: vi.fn() }),
);

vi.mock(
  '@transaction/services/get-transaction-statistics/get-statistics-matching',
  () => ({ getStatisticsMatching: vi.fn() }),
);

vi.mock(
  '@transaction/services/get-transaction-statistics/parse-statistics-result',
  () => ({ parseStatisticsResult: vi.fn() }),
);

vi.mock('@transaction/model', () => ({
  TransactionModel: { aggregate: vi.fn() },
}));

describe('getTransactionStatistics', () => {
  it('get transaction statistics', async () => {
    const USER_ID = randomObjectIdString();
    const [MATCHING, GROUPING, RESULT] = ['matching', 'grouping', 'result'];

    (getStatisticsMatching as Mock).mockReturnValue(MATCHING);
    (getStatisticsGrouping as Mock).mockReturnValue(GROUPING);
    (TransactionModel.aggregate as Mock).mockResolvedValue(RESULT);
    (parseStatisticsResult as Mock).mockResolvedValue(RESULT);
    const query: TransactionStatisticsQuery = {
      year: 2026,
      currency: 'PLN',
      transactionType: 'expense',
    };

    const result = await getTransactionStatistics(query, USER_ID);

    expect(getStatisticsMatching).toHaveBeenCalledOnce();
    expect(getStatisticsMatching).toHaveBeenCalledWith(query, USER_ID);
    expect(getStatisticsGrouping).toHaveBeenCalledOnce();
    expect(getStatisticsGrouping).toHaveBeenCalledWith(query);
    expect(TransactionModel.aggregate).toHaveBeenCalledOnce();
    expect(TransactionModel.aggregate).toHaveBeenCalledWith([
      { $match: MATCHING },
      GROUPING,
    ]);
    expect(parseStatisticsResult).toHaveBeenCalledOnce();
    expect(parseStatisticsResult).toHaveBeenCalledWith(RESULT, query);
    expect(result).toEqual(RESULT);
  });
});
