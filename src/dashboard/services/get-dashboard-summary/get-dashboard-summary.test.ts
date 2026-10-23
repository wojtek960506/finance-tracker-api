import * as investmentServices from '@investment/services';
import * as sportsServices from '@sports/services';
import * as vehiclesServices from '@vehicles/services';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as currencyServices from '@currency/services';
import { USER_ID_STR } from '@testing/factories/general';
import * as transactionServices from '@transaction/services';

import { getDashboardSummary } from './get-dashboard-summary';

vi.mock('@transaction/services', () => ({
  getTransactionTotals: vi.fn(),
  getTransactions: vi.fn(),
}));

vi.mock('@investment/services', () => ({
  getInvestmentSummary: vi.fn(),
}));

vi.mock('@vehicles/services', () => ({
  getVehiclesSummary: vi.fn(),
}));

vi.mock('@sports/services', () => ({
  getSportStats: vi.fn(),
}));

vi.mock('@currency/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@currency/services')>();
  return {
    ...actual,
    fetchLatestRates: vi.fn(),
  };
});

describe('getDashboardSummary', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('aggregates data when all domains are empty', async () => {
    vi.mocked(transactionServices.getTransactionTotals).mockResolvedValue({
      overall: { totalItems: 0, expense: { totalItems: 0 }, income: { totalItems: 0 } },
      byCurrency: {},
    });
    vi.mocked(transactionServices.getTransactions).mockResolvedValue({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      items: [],
    });
    vi.mocked(investmentServices.getInvestmentSummary).mockResolvedValue({
      baseCurrency: 'PLN',
      grandTotalNormalized: undefined,
      totalsByCurrency: {},
      instruments: [],
    });
    vi.mocked(vehiclesServices.getVehiclesSummary).mockResolvedValue({
      summary: {
        totalVehicles: 0,
        totalSpentPln: 0,
        totalFuelSpentPln: 0,
        totalMaintenanceSpentPln: 0,
        totalEquipmentSpentPln: 0,
        totalFuelEntriesCount: 0,
        totalMaintenanceCount: 0,
        totalEquipmentCount: 0,
        totalDistanceKm: 0,
      },
      vehicles: [],
    });
    vi.mocked(sportsServices.getSportStats).mockResolvedValue({
      totalCostPln: 0,
      totalEntries: 0,
      byCategory: [],
      byYear: [],
      byMonth: [],
    });

    const result = await getDashboardSummary(USER_ID_STR, {
      baseCurrency: 'PLN',
      recentLimit: 10,
    });

    expect(result).toEqual({
      baseCurrency: 'PLN',
      transactions: {
        totalItems: 0,
        totalExpenseAmount: 0,
        totalIncomeAmount: 0,
        byCurrency: {},
      },
      investments: {
        totalCurrentValue: 0,
        totalNetInvested: 0,
        totalPnL: 0,
        roiPercentage: 0,
        instrumentsCount: 0,
      },
      vehicles: {
        totalVehicles: 0,
        totalSpentPln: 0,
        totalFuelSpentPln: 0,
        totalMaintenanceSpentPln: 0,
        totalEquipmentSpentPln: 0,
      },
      sports: {
        totalCostPln: 0,
        totalEntries: 0,
        categoriesCount: 0,
      },
      recentTransactions: [],
    });
  });

  it('correctly aggregates populated domain data with PLN baseCurrency', async () => {
    vi.mocked(transactionServices.getTransactionTotals).mockResolvedValue({
      overall: {
        totalItems: 3,
        expense: { totalItems: 2 },
        income: { totalItems: 1 },
      },
      byCurrency: {
        PLN: {
          totalItems: 3,
          expense: {
            totalAmount: 150.5,
            totalItems: 2,
            averageAmount: 75.25,
            maxAmount: 100.5,
            minAmount: 50,
          },
          income: {
            totalAmount: 500,
            totalItems: 1,
            averageAmount: 500,
            maxAmount: 500,
            minAmount: 500,
          },
        },
      },
    });

    const mockTxItem = {
      id: 'tx-1',
      ownerId: USER_ID_STR,
      kind: 'standard' as const,
      transactionType: 'expense' as const,
      amount: 100.5,
      currency: 'PLN' as const,
      date: new Date('2026-10-23T10:00:00Z'),
      description: 'Groceries',
      sourceIndex: 1,
      createdAt: new Date('2026-10-23T10:00:00Z'),
      updatedAt: new Date('2026-10-23T10:00:00Z'),
      category: { id: 'c-1', name: 'Food', type: 'user' as const },
      account: { id: 'a-1', name: 'Checking', type: 'user' as const },
      paymentMethod: { id: 'p-1', name: 'Card', type: 'user' as const },
    };

    vi.mocked(transactionServices.getTransactions).mockResolvedValue({
      page: 1,
      limit: 5,
      total: 3,
      totalPages: 1,
      items: [mockTxItem],
    });

    vi.mocked(investmentServices.getInvestmentSummary).mockResolvedValue({
      baseCurrency: 'PLN',
      grandTotalNormalized: {
        currentValue: 12000,
        netInvested: 10000,
        pnl: 2000,
        roiPercentage: 20,
      },
      totalsByCurrency: {
        PLN: {
          currency: 'PLN',
          totalCurrentValue: 12000,
          totalNetInvested: 10000,
          totalBought: 10000,
          totalSold: 0,
          totalInterest: 0,
          totalFees: 0,
          totalPnL: 2000,
          roiPercentage: 20,
          instrumentsCount: 2,
        },
      },
      instruments: [{} as any, {} as any],
    });

    vi.mocked(vehiclesServices.getVehiclesSummary).mockResolvedValue({
      summary: {
        totalVehicles: 2,
        totalSpentPln: 2500,
        totalFuelSpentPln: 1500,
        totalMaintenanceSpentPln: 800,
        totalEquipmentSpentPln: 200,
        totalFuelEntriesCount: 5,
        totalMaintenanceCount: 2,
        totalEquipmentCount: 1,
        totalDistanceKm: 1200,
      },
      vehicles: [],
    });

    vi.mocked(sportsServices.getSportStats).mockResolvedValue({
      totalCostPln: 450,
      totalEntries: 6,
      byCategory: [{} as any, {} as any, {} as any],
      byYear: [],
      byMonth: [],
    });

    const result = await getDashboardSummary(USER_ID_STR, {
      baseCurrency: 'PLN',
      recentLimit: 5,
    });

    expect(result).toEqual({
      baseCurrency: 'PLN',
      transactions: {
        totalItems: 3,
        totalExpenseAmount: 150.5,
        totalIncomeAmount: 500,
        byCurrency: {
          PLN: {
            totalItems: 3,
            totalExpenseAmount: 150.5,
            totalIncomeAmount: 500,
          },
        },
      },
      investments: {
        totalCurrentValue: 12000,
        totalNetInvested: 10000,
        totalPnL: 2000,
        roiPercentage: 20,
        instrumentsCount: 2,
      },
      vehicles: {
        totalVehicles: 2,
        totalSpentPln: 2500,
        totalFuelSpentPln: 1500,
        totalMaintenanceSpentPln: 800,
        totalEquipmentSpentPln: 200,
      },
      sports: {
        totalCostPln: 450,
        totalEntries: 6,
        categoriesCount: 3,
      },
      recentTransactions: [mockTxItem],
    });
  });

  it('converts multi-currency transactions using exchange rates', async () => {
    vi.mocked(transactionServices.getTransactionTotals).mockResolvedValue({
      overall: {
        totalItems: 2,
        expense: { totalItems: 2 },
        income: { totalItems: 0 },
      },
      byCurrency: {
        PLN: {
          totalItems: 1,
          expense: {
            totalAmount: 100,
            totalItems: 1,
            averageAmount: 100,
            maxAmount: 100,
            minAmount: 100,
          },
          income: {
            totalAmount: 0,
            totalItems: 0,
            averageAmount: 0,
            maxAmount: 0,
            minAmount: 0,
          },
        },
        EUR: {
          totalItems: 1,
          expense: {
            totalAmount: 50,
            totalItems: 1,
            averageAmount: 50,
            maxAmount: 50,
            minAmount: 50,
          },
          income: {
            totalAmount: 0,
            totalItems: 0,
            averageAmount: 0,
            maxAmount: 0,
            minAmount: 0,
          },
        },
      },
    });

    vi.mocked(currencyServices.fetchLatestRates).mockResolvedValue({
      date: '2026-10-23',
      base: 'USD',
      rates: {
        EUR: '0.9',
        PLN: '4.0',
      },
    });

    vi.mocked(transactionServices.getTransactions).mockResolvedValue({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
      items: [],
    });
    vi.mocked(investmentServices.getInvestmentSummary).mockResolvedValue({
      baseCurrency: 'PLN',
      grandTotalNormalized: undefined,
      totalsByCurrency: {},
      instruments: [],
    });
    vi.mocked(vehiclesServices.getVehiclesSummary).mockResolvedValue({
      summary: {
        totalVehicles: 0,
        totalSpentPln: 0,
        totalFuelSpentPln: 0,
        totalMaintenanceSpentPln: 0,
        totalEquipmentSpentPln: 0,
        totalFuelEntriesCount: 0,
        totalMaintenanceCount: 0,
        totalEquipmentCount: 0,
        totalDistanceKm: 0,
      },
      vehicles: [],
    });
    vi.mocked(sportsServices.getSportStats).mockResolvedValue({
      totalCostPln: 0,
      totalEntries: 0,
      byCategory: [],
      byYear: [],
      byMonth: [],
    });

    const result = await getDashboardSummary(USER_ID_STR, {
      baseCurrency: 'PLN',
      recentLimit: 10,
    });

    // EUR rate to PLN = 4.0 / 0.9 = 4.4444...
    // 50 EUR * (4.0 / 0.9) = 222.22 PLN
    // Total PLN expense = 100 + 222.22 = 322.22
    expect(result.transactions.totalExpenseAmount).toBe(322.22);
    expect(result.transactions.totalItems).toBe(2);
    expect(result.transactions.byCurrency?.EUR.totalExpenseAmount).toBe(50);
  });
});
