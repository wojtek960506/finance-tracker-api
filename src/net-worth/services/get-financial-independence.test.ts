import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as currencyServices from '@currency/services';
import * as namedResourceDb from '@named-resource/db';
import { TransactionModel } from '@transaction/model';

import { getFinancialIndependence } from './get-financial-independence';
import * as netWorthServices from './get-net-worth';

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    aggregate: vi.fn(),
  },
}));

vi.mock('@named-resource/db', () => ({
  findNamedResources: vi.fn(),
}));

vi.mock('./get-net-worth', () => ({
  getNetWorth: vi.fn(),
}));

vi.mock('@currency/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@currency/services')>();
  return {
    ...actual,
    fetchLatestRates: vi.fn(),
  };
});

describe('getFinancialIndependence service', () => {
  const userId = '507f1f77bcf86cd799439011';
  const workCatId = '507f1f77bcf86cd799439021';
  const foodCatId = '507f1f77bcf86cd799439022';
  const divCatId = '507f1f77bcf86cd799439023';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // prettier-ignore
  it(
    'computes financial independence for a standard 12-month period with auto work detection',
    async () => {
    // Categories
    vi.mocked(namedResourceDb.findNamedResources).mockResolvedValue([
      {
        _id: workCatId as any,
        name: 'Wynagrodzenie / Praca',
        nameNormalized: 'wynagrodzenie / praca',
        type: 'user',
      } as any,
      {
        _id: foodCatId as any,
        name: 'Jedzenie',
        nameNormalized: 'jedzenie',
        type: 'user',
      } as any,
      {
        _id: divCatId as any,
        name: 'Dywidendy',
        nameNormalized: 'dywidendy',
        type: 'user',
      } as any,
    ]);

    // Net worth: total 240,000 PLN; liquidCash: 60,000 PLN; savings: 40,000 PLN
    vi.mocked(netWorthServices.getNetWorth).mockResolvedValue({
      baseCurrency: 'PLN',
      netWorth: {
        total: 240000,
        liquidCash: 60000,
        investments: 180000,
      },
      byCurrency: {
        PLN: {
          currency: 'PLN',
          cash: 60000,
          investments: 180000,
          total: 240000,
          normalizedTotal: 240000,
        },
      },
      allocation: {
        cash: { category: 'cash', amount: 60000, percentage: 25 },
        savings: { category: 'savings', amount: 40000, percentage: 16.67 },
        share: { category: 'share', amount: 140000, percentage: 58.33 },
      },
    });

    // Transactions in 12 months:
    // Expenses: 72,000 PLN (6,000 / month)
    // Work income: 144,000 PLN (12,000 / month) -> excluded
    // Non-work income (dividends): 12,000 PLN (1,000 / month) -> offsets expenses
    // Net burn rate = 6,000 - 1,000 = 5,000 PLN / month
    vi.mocked(TransactionModel.aggregate).mockResolvedValue([
      {
        _id: { currency: 'PLN', transactionType: 'expense', isExcludedCategory: false },
        totalAmount: 72000,
      },
      {
        _id: { currency: 'PLN', transactionType: 'income', isExcludedCategory: true },
        totalAmount: 144000,
      },
      {
        _id: { currency: 'PLN', transactionType: 'income', isExcludedCategory: false },
        totalAmount: 12000,
      },
    ]);

    const result = await getFinancialIndependence(userId, {
      baseCurrency: 'PLN',
      periodMonths: 12,
    });

    expect(TransactionModel.aggregate).toHaveBeenCalledWith([
      {
        $match: expect.objectContaining({
          kind: { $nin: ['transfer', 'exchange', 'investment'] },
        }),
      },
      expect.any(Object),
    ]);

    expect(result.baseCurrency).toBe('PLN');
    expect(result.period.monthsCount).toBe(12);

    expect(result.netWorth).toEqual({
      total: 240000,
      liquidCash: 60000,
      savings: 40000,
      liquidCapital: 100000,
      lockedInvestments: 140000,
    });

    expect(result.monthlyAverages).toEqual({
      grossExpenses: 6000,
      nonWorkIncome: 1000,
      workIncome: 12000,
      totalIncome: 13000,
      netBurnRate: 5000,
    });

    // Independence:
    // Net worth months: 240,000 / 5,000 = 48.0 months
    // Liquid capital months: 100,000 / 5,000 = 20.0 months
    // Liquid cash months: 60,000 / 5,000 = 12.0 months
    expect(result.independence).toEqual({
      netWorthMonths: 48,
      liquidCapitalMonths: 20,
      liquidCashMonths: 12,
      isPerpetual: false,
    });

    // Zero-income baseline:
    // Net worth months: 240,000 / 6,000 = 40.0 months
    // Liquid capital months: 100,000 / 6,000 = 16.67 months
    // Liquid cash months: 60,000 / 6,000 = 10.0 months
    expect(result.zeroIncomeBaseline).toEqual({
      netWorthMonths: 40,
      liquidCapitalMonths: 16.67,
      liquidCashMonths: 10,
    });

    expect(result.excludedCategories).toEqual([
      { id: workCatId, name: 'Wynagrodzenie / Praca' },
    ]);
  });

  // prettier-ignore
  it(
    'marks perpetual independence when non-work income exceeds expenses',
    async () => {
    vi.mocked(namedResourceDb.findNamedResources).mockResolvedValue([
      {
        _id: workCatId as any,
        name: 'Praca',
        nameNormalized: 'praca',
        type: 'user',
      } as any,
    ]);

    vi.mocked(netWorthServices.getNetWorth).mockResolvedValue({
      baseCurrency: 'PLN',
      netWorth: { total: 100000, liquidCash: 20000, investments: 80000 },
      byCurrency: {},
      allocation: {
        cash: { category: 'cash', amount: 20000, percentage: 20 },
      },
    });

    // Expenses: 36,000 PLN (3,000 / month)
    // Non-work income (rental): 48,000 PLN (4,000 / month) -> exceeds expenses
    // Net burn rate = Math.max(0, 3,000 - 4,000) = 0 (perpetual!)
    vi.mocked(TransactionModel.aggregate).mockResolvedValue([
      {
        _id: { currency: 'PLN', transactionType: 'expense', isExcludedCategory: false },
        totalAmount: 36000,
      },
      {
        _id: { currency: 'PLN', transactionType: 'income', isExcludedCategory: false },
        totalAmount: 48000,
      },
    ]);

    const result = await getFinancialIndependence(userId, { periodMonths: 12 });

    expect(result.monthlyAverages.netBurnRate).toBe(0);
    expect(result.independence).toEqual({
      isPerpetual: true,
      netWorthMonths: null,
      liquidCapitalMonths: null,
      liquidCashMonths: null,
    });

    // Zero-income baseline still calculates worst case at 3,000 / mo
    expect(result.zeroIncomeBaseline.netWorthMonths).toBe(33.33);
  });

  it('excludes categories from both expenses and non-work incomes', async () => {
    const businessCatId = '507f1f77bcf86cd799439090';
    const livingFoodCatId = '507f1f77bcf86cd799439091';

    vi.mocked(namedResourceDb.findNamedResources).mockResolvedValue([
      {
        _id: businessCatId as any,
        name: 'Business B2B Costs',
        nameNormalized: 'business b2b costs',
        type: 'user',
      } as any,
      {
        _id: livingFoodCatId as any,
        name: 'Groceries',
        nameNormalized: 'groceries',
        type: 'user',
      } as any,
    ]);

    vi.mocked(netWorthServices.getNetWorth).mockResolvedValue({
      baseCurrency: 'PLN',
      netWorth: { total: 100000, liquidCash: 50000, investments: 50000 },
      byCurrency: {},
      allocation: {},
    });

    // Living expenses: 24,000 PLN (2,000 / month)
    // Business expenses (excluded): 60,000 PLN (5,000 / month) -> not in grossExpenses
    // Non-work income: 6,000 PLN (500 / month)
    // Work income (business excluded category): 120,000 PLN
    vi.mocked(TransactionModel.aggregate).mockResolvedValue([
      {
        _id: { currency: 'PLN', transactionType: 'expense', isExcludedCategory: false },
        totalAmount: 24000,
      },
      {
        _id: { currency: 'PLN', transactionType: 'expense', isExcludedCategory: true },
        totalAmount: 60000,
      },
      {
        _id: { currency: 'PLN', transactionType: 'income', isExcludedCategory: false },
        totalAmount: 6000,
      },
      {
        _id: { currency: 'PLN', transactionType: 'income', isExcludedCategory: true },
        totalAmount: 120000,
      },
    ]);

    const result = await getFinancialIndependence(userId, {
      baseCurrency: 'PLN',
      periodMonths: 12,
      excludeCategoryIds: [businessCatId],
    });

    // grossExpenses must only be 24,000 / 12 = 2,000 (NOT 7,000)
    expect(result.monthlyAverages.grossExpenses).toBe(2000);
    expect(result.monthlyAverages.nonWorkIncome).toBe(500);
    expect(result.monthlyAverages.workIncome).toBe(10000);
    expect(result.monthlyAverages.netBurnRate).toBe(1500); // 2000 - 500
    expect(result.independence.netWorthMonths).toBe(66.67); // 100,000 / 1,500
  });

  it('supports explicit excludeCategoryNames and multi-currency normalization', async () => {
    const customSalaryCatId = '507f1f77bcf86cd799439099';
    vi.mocked(namedResourceDb.findNamedResources).mockResolvedValue([
      {
        _id: customSalaryCatId as any,
        name: 'Main Client Invoice',
        nameNormalized: 'main client invoice',
        type: 'user',
      } as any,
    ]);

    vi.mocked(netWorthServices.getNetWorth).mockResolvedValue({
      baseCurrency: 'PLN',
      netWorth: { total: 120000, liquidCash: 40000, investments: 80000 },
      byCurrency: {},
      allocation: {
        cash: { category: 'cash', amount: 40000, percentage: 33.33 },
      },
    });

    // EUR Expenses: 12,000 EUR (at 5.0 rate = 60,000 PLN total in 6 months -> 10,000 PLN/mo)
    // USD Non-work income: 3,000 USD (at 4.0 rate = 12,000 PLN total in 6 months -> 2,000 PLN/mo)
    // Work income: 20,000 USD
    vi.mocked(TransactionModel.aggregate).mockResolvedValue([
      {
        _id: { currency: 'EUR', transactionType: 'expense', isExcludedCategory: false },
        totalAmount: 12000,
      },
      {
        _id: { currency: 'USD', transactionType: 'income', isExcludedCategory: false },
        totalAmount: 3000,
      },
      {
        _id: { currency: 'USD', transactionType: 'income', isExcludedCategory: true },
        totalAmount: 20000,
      },
    ]);

    vi.mocked(currencyServices.fetchLatestRates).mockResolvedValue({
      base: 'USD',
      date: '2026-09-19',
      rates: {
        PLN: '4.0',
        EUR: '0.8', // 1 EUR = (4.0 / 0.8) = 5.0 PLN
      },
    });

    const result = await getFinancialIndependence(userId, {
      baseCurrency: 'PLN',
      periodMonths: 6,
      excludeCategoryNames: ['main client invoice'],
    });

    expect(result.excludedCategories).toEqual([
      { id: customSalaryCatId, name: 'Main Client Invoice' },
    ]);
    expect(result.monthlyAverages.grossExpenses).toBe(10000);
    expect(result.monthlyAverages.nonWorkIncome).toBe(2000);
    expect(result.monthlyAverages.netBurnRate).toBe(8000);
    expect(result.independence.netWorthMonths).toBe(15); // 120000 / 8000
    expect(result.independence.liquidCashMonths).toBe(5); // 40000 / 8000
  });

  it('supports combining excludeCategoryIds and excludeCategoryNames simultaneously', async () => {
    const catId1 = '507f1f77bcf86cd799439081';
    const catId2 = '507f1f77bcf86cd799439082';
    const catId3 = '507f1f77bcf86cd799439083';

    vi.mocked(namedResourceDb.findNamedResources).mockResolvedValue([
      {
        _id: catId1 as any,
        name: 'Excluded By ID',
        nameNormalized: 'excluded by id',
        type: 'user',
      } as any,
      {
        _id: catId2 as any,
        name: 'Excluded By Name',
        nameNormalized: 'excluded by name',
        type: 'user',
      } as any,
      {
        _id: catId3 as any,
        name: 'Regular Living Expense',
        nameNormalized: 'regular living expense',
        type: 'user',
      } as any,
    ]);

    vi.mocked(netWorthServices.getNetWorth).mockResolvedValue({
      baseCurrency: 'PLN',
      netWorth: { total: 50000, liquidCash: 50000, investments: 0 },
      byCurrency: {},
      allocation: {},
    });

    vi.mocked(TransactionModel.aggregate).mockResolvedValue([]);

    const result = await getFinancialIndependence(userId, {
      baseCurrency: 'PLN',
      periodMonths: 12,
      excludeCategoryIds: [catId1],
      excludeCategoryNames: ['Excluded By Name'],
    });

    expect(result.excludedCategories).toEqual([
      { id: catId1, name: 'Excluded By ID' },
      { id: catId2, name: 'Excluded By Name' },
    ]);
  });
});
