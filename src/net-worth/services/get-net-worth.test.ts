import * as investmentServices from '@investment/services';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as currencyServices from '@currency/services';
import { TransactionModel } from '@transaction/model';

import { getNetWorth } from './get-net-worth';

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    aggregate: vi.fn(),
  },
}));

vi.mock('@investment/services', () => ({
  getInvestmentSummary: vi.fn(),
}));

vi.mock('@currency/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@currency/services')>();
  return {
    ...actual,
    fetchLatestRates: vi.fn(),
  };
});

describe('getNetWorth service', () => {
  const userId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns zero state when user has no cash and no investments', async () => {
    vi.mocked(TransactionModel.aggregate).mockResolvedValue([]);
    vi.mocked(investmentServices.getInvestmentSummary).mockResolvedValue({
      totalsByCurrency: {},
      instruments: [],
    });

    const result = await getNetWorth(userId);

    expect(result).toEqual({
      baseCurrency: undefined,
      netWorth: {
        total: 0,
        liquidCash: 0,
        investments: 0,
      },
      byCurrency: {},
      allocation: {
        cash: {
          category: 'cash',
          amount: 0,
          percentage: 0,
        },
      },
    });
  });

  it('computes net worth for single currency without baseCurrency param', async () => {
    vi.mocked(TransactionModel.aggregate).mockResolvedValue([
      { _id: { currency: 'PLN' }, totalAmount: 25000 },
    ]);
    vi.mocked(investmentServices.getInvestmentSummary).mockResolvedValue({
      totalsByCurrency: {
        PLN: {
          currency: 'PLN',
          totalCurrentValue: 75000,
          totalNetInvested: 70000,
          totalBought: 70000,
          totalSold: 0,
          totalInterest: 5000,
          totalFees: 0,
          totalPnL: 5000,
          roiPercentage: 7.14,
          instrumentsCount: 1,
        },
      },
      instruments: [
        {
          id: '507f1f77bcf86cd799439012',
          name: 'Lokata',
          kind: 'termDeposit',
          currency: 'PLN',
          currentValue: 75000,
          netInvested: 70000,
          totalBought: 70000,
          totalSold: 0,
          totalInterest: 5000,
          totalFees: 0,
          pnl: 5000,
          roiPercentage: 7.14,
          lastSnapshotDate: null,
          operationsCount: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    const result = await getNetWorth(userId);

    expect(TransactionModel.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          ownerId: new Types.ObjectId(userId),
          deletion: null,
        },
      },
      expect.any(Object),
    ]);

    expect(result.netWorth).toEqual({
      total: 100000,
      liquidCash: 25000,
      investments: 75000,
    });
    expect(result.byCurrency.PLN).toEqual({
      currency: 'PLN',
      cash: 25000,
      investments: 75000,
      total: 100000,
      normalizedTotal: undefined,
    });
    expect(result.allocation).toEqual({
      cash: {
        category: 'cash',
        amount: 25000,
        percentage: 25,
      },
      termDeposit: {
        category: 'termDeposit',
        amount: 75000,
        percentage: 75,
      },
    });
  });

  it('normalizes multi-currency balances and computes full allocation breakdown', async () => {
    // Cash: 35000 PLN, 5000 USD
    vi.mocked(TransactionModel.aggregate).mockResolvedValue([
      { _id: { currency: 'PLN' }, totalAmount: 35000 },
      { _id: { currency: 'USD' }, totalAmount: 5000 },
    ]);

    // Investments:
    // USD: Apple (share) 10000 USD
    // PLN: Lokata (termDeposit) 35000 PLN, Fundusz (fund) 20000 PLN
    vi.mocked(investmentServices.getInvestmentSummary).mockResolvedValue({
      totalsByCurrency: {
        USD: {
          currency: 'USD',
          totalCurrentValue: 10000,
          totalNetInvested: 8000,
          totalBought: 8000,
          totalSold: 0,
          totalInterest: 0,
          totalFees: 0,
          totalPnL: 2000,
          roiPercentage: 25,
          instrumentsCount: 1,
        },
        PLN: {
          currency: 'PLN',
          totalCurrentValue: 55000,
          totalNetInvested: 50000,
          totalBought: 50000,
          totalSold: 0,
          totalInterest: 5000,
          totalFees: 0,
          totalPnL: 5000,
          roiPercentage: 10,
          instrumentsCount: 2,
        },
      },
      instruments: [
        {
          id: '507f1f77bcf86cd799439012',
          name: 'Apple Inc.',
          kind: 'share',
          currency: 'USD',
          currentValue: 10000,
          netInvested: 8000,
          totalBought: 8000,
          totalSold: 0,
          totalInterest: 0,
          totalFees: 0,
          pnl: 2000,
          roiPercentage: 25,
          lastSnapshotDate: null,
          operationsCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '507f1f77bcf86cd799439013',
          name: 'Lokata 3M',
          kind: 'termDeposit',
          currency: 'PLN',
          currentValue: 35000,
          netInvested: 35000,
          totalBought: 35000,
          totalSold: 0,
          totalInterest: 0,
          totalFees: 0,
          pnl: 0,
          roiPercentage: 0,
          lastSnapshotDate: null,
          operationsCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '507f1f77bcf86cd799439014',
          name: 'Fundusz Akcji',
          kind: 'fund',
          currency: 'PLN',
          currentValue: 20000,
          netInvested: 15000,
          totalBought: 15000,
          totalSold: 0,
          totalInterest: 0,
          totalFees: 0,
          pnl: 5000,
          roiPercentage: 33.33,
          lastSnapshotDate: null,
          operationsCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    vi.mocked(currencyServices.fetchLatestRates).mockResolvedValue({
      base: 'USD',
      date: '2026-09-19',
      rates: {
        PLN: '4.0',
      },
    });

    const result = await getNetWorth(userId, { baseCurrency: 'PLN' });

    expect(result.baseCurrency).toBe('PLN');

    // PLN: cash 35000 + inv 55000 = total 90000 PLN (normalized: 90000)
    expect(result.byCurrency.PLN).toEqual({
      currency: 'PLN',
      cash: 35000,
      investments: 55000,
      total: 90000,
      normalizedTotal: 90000,
    });

    // USD: cash 5000 + inv 10000 = total 15000 USD (normalized at 4.0: 60000 PLN)
    expect(result.byCurrency.USD).toEqual({
      currency: 'USD',
      cash: 5000,
      investments: 10000,
      total: 15000,
      normalizedTotal: 60000,
    });

    // Liquid cash: 35000 PLN + (5000 * 4) = 55000 PLN
    // Investments: 55000 PLN + (10000 * 4) = 95000 PLN
    // Total Net Worth: 150000 PLN
    expect(result.netWorth).toEqual({
      total: 150000,
      liquidCash: 55000,
      investments: 95000,
    });

    // Allocation percentages:
    // cash: 55000 / 150000 = 36.67%
    // share: 40000 / 150000 = 26.67%
    // termDeposit: 35000 / 150000 = 23.33%
    // fund: 20000 / 150000 = 13.33%
    expect(result.allocation).toEqual({
      cash: {
        category: 'cash',
        amount: 55000,
        percentage: 36.67,
      },
      share: {
        category: 'share',
        amount: 40000,
        percentage: 26.67,
      },
      termDeposit: {
        category: 'termDeposit',
        amount: 35000,
        percentage: 23.33,
      },
      fund: {
        category: 'fund',
        amount: 20000,
        percentage: 13.33,
      },
    });
  });
});
