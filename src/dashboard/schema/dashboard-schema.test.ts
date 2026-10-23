import { describe, expect, it } from 'vitest';

import {
  DashboardInvestmentsSummarySchema,
  DashboardSportsSummarySchema,
  DashboardSummaryQuerySchema,
  DashboardSummaryResponseSchema,
  DashboardTransactionsSummarySchema,
  DashboardVehiclesSummarySchema,
} from './dashboard-schema';

describe('dashboard schemas', () => {
  it('validates query schema with defaults', () => {
    expect(DashboardSummaryQuerySchema.parse({})).toEqual({
      baseCurrency: 'PLN',
      recentLimit: 10,
    });
  });

  it('validates custom query schema parameters', () => {
    expect(
      DashboardSummaryQuerySchema.parse({
        baseCurrency: 'EUR',
        recentLimit: '15',
      }),
    ).toEqual({
      baseCurrency: 'EUR',
      recentLimit: 15,
    });
  });

  it('rejects invalid recentLimit bounds', () => {
    expect(() =>
      DashboardSummaryQuerySchema.parse({
        recentLimit: 0,
      }),
    ).toThrow();

    expect(() =>
      DashboardSummaryQuerySchema.parse({
        recentLimit: 25,
      }),
    ).toThrow();
  });

  it('validates transactions summary schema', () => {
    const transactions = {
      totalItems: 5,
      totalExpenseAmount: 120.5,
      totalIncomeAmount: 400,
      byCurrency: {
        PLN: {
          totalItems: 5,
          totalExpenseAmount: 120.5,
          totalIncomeAmount: 400,
        },
      },
    };
    expect(DashboardTransactionsSummarySchema.parse(transactions)).toEqual(transactions);
  });

  it('validates investments summary schema', () => {
    const investments = {
      totalCurrentValue: 50000,
      totalNetInvested: 45000,
      totalPnL: 5000,
      roiPercentage: 11.11,
      instrumentsCount: 4,
    };
    expect(DashboardInvestmentsSummarySchema.parse(investments)).toEqual(investments);
  });

  it('validates vehicles summary schema', () => {
    const vehicles = {
      totalVehicles: 2,
      totalSpentPln: 1500,
      totalFuelSpentPln: 900,
      totalMaintenanceSpentPln: 400,
      totalEquipmentSpentPln: 200,
    };
    expect(DashboardVehiclesSummarySchema.parse(vehicles)).toEqual(vehicles);
  });

  it('validates sports summary schema', () => {
    const sports = {
      totalCostPln: 800,
      totalEntries: 20,
      categoriesCount: 2,
    };
    expect(DashboardSportsSummarySchema.parse(sports)).toEqual(sports);
  });

  it('validates complete dashboard summary response schema', () => {
    const response = {
      baseCurrency: 'PLN' as const,
      transactions: {
        totalItems: 1,
        totalExpenseAmount: 50,
        totalIncomeAmount: 0,
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
      recentTransactions: [
        {
          id: '60d0fe4f5311236168a109ca',
          ownerId: '60d0fe4f5311236168a109cb',
          kind: 'standard' as const,
          transactionType: 'expense' as const,
          amount: 50,
          currency: 'PLN' as const,
          date: new Date('2026-10-23T12:00:00Z'),
          description: 'Lunch',
          sourceIndex: 1,
          createdAt: new Date('2026-10-23T12:00:00Z'),
          updatedAt: new Date('2026-10-23T12:00:00Z'),
          category: {
            id: '60d0fe4f5311236168a109cc',
            name: 'Food',
            type: 'user' as const,
          },
          account: {
            id: '60d0fe4f5311236168a109cd',
            name: 'Main',
            type: 'user' as const,
          },
          paymentMethod: {
            id: '60d0fe4f5311236168a109ce',
            name: 'Card',
            type: 'user' as const,
          },
        },
      ],
    };

    expect(DashboardSummaryResponseSchema.parse(response)).toEqual(response);
  });
});
