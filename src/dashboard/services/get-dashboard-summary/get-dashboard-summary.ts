import {
  DashboardInvestmentsSummaryDTO,
  DashboardSummaryQuery,
  DashboardSummaryResponseDTO,
  DashboardTransactionCurrencyItemDTO,
  DashboardTransactionsSummaryDTO,
} from '@dashboard/schema';
import { getInvestmentSummary } from '@investment/services';
import { getSportStats } from '@sports/services';
import { getVehiclesSummary } from '@vehicles/services';

import { CurrencyCode } from '@currency/schema';
import {
  fetchLatestRates,
  getCrossRate,
  roundMoney,
  USD_CURRENCY_CODE,
} from '@currency/services';
import { getTransactions, getTransactionTotals } from '@transaction/services';

export const getDashboardSummary = async (
  userId: string,
  query: DashboardSummaryQuery = { baseCurrency: 'PLN', recentLimit: 10 },
): Promise<DashboardSummaryResponseDTO> => {
  const baseCurrency = query.baseCurrency ?? 'PLN';
  const recentLimit = query.recentLimit ?? 10;

  const [
    transactionsTotals,
    recentTransactionsResult,
    investmentSummary,
    vehiclesSummary,
    sportStats,
  ] = await Promise.all([
    getTransactionTotals({}, userId),
    getTransactions(
      {
        page: 1,
        limit: recentLimit,
        sortBy: 'date',
        sortOrder: 'desc',
      },
      userId,
    ),
    getInvestmentSummary(userId, { baseCurrency }),
    getVehiclesSummary(userId),
    getSportStats(userId),
  ]);

  const totalsByCurrency = transactionsTotals.byCurrency ?? {};
  const currencyKeys = Object.keys(totalsByCurrency);

  let rates: Record<string, string> | null = null;
  const nonBaseCurrencies = currencyKeys.filter(
    (c) => c !== baseCurrency && c !== USD_CURRENCY_CODE,
  );
  if (nonBaseCurrencies.length > 0) {
    const symbolsToFetch = [...new Set([...nonBaseCurrencies, baseCurrency])].filter(
      (c) => c !== USD_CURRENCY_CODE,
    );
    const ratesResponse = await fetchLatestRates(symbolsToFetch);
    rates = ratesResponse?.rates ?? null;
  }

  const byCurrency: Record<string, DashboardTransactionCurrencyItemDTO> = {};
  let totalExpenseAmount = 0;
  let totalIncomeAmount = 0;
  let totalItems = 0;

  for (const curr of currencyKeys) {
    const item = totalsByCurrency[curr];
    const expense = roundMoney(item.expense?.totalAmount ?? 0);
    const income = roundMoney(item.income?.totalAmount ?? 0);
    const itemsCount = item.totalItems ?? 0;

    byCurrency[curr] = {
      totalItems: itemsCount,
      totalExpenseAmount: expense,
      totalIncomeAmount: income,
    };

    totalItems += itemsCount;

    const rate = getCrossRate(curr, baseCurrency, rates);
    if (rate !== null) {
      totalExpenseAmount = roundMoney(totalExpenseAmount + expense * rate);
      totalIncomeAmount = roundMoney(totalIncomeAmount + income * rate);
    } else {
      totalExpenseAmount = roundMoney(totalExpenseAmount + expense);
      totalIncomeAmount = roundMoney(totalIncomeAmount + income);
    }
  }

  const transactionsSummary: DashboardTransactionsSummaryDTO = {
    totalItems,
    totalExpenseAmount,
    totalIncomeAmount,
    byCurrency,
  };

  let totalCurrentValue: number;
  let totalNetInvested: number;
  let totalPnL: number;
  let roiPercentage: number;
  const instrumentsCount = investmentSummary.instruments.length;

  if (investmentSummary.grandTotalNormalized) {
    totalCurrentValue = investmentSummary.grandTotalNormalized.currentValue;
    totalNetInvested = investmentSummary.grandTotalNormalized.netInvested;
    totalPnL = investmentSummary.grandTotalNormalized.pnl;
    roiPercentage = investmentSummary.grandTotalNormalized.roiPercentage;
  } else {
    let sumVal = 0;
    let sumNet = 0;
    let sumPnL = 0;
    for (const group of Object.values(investmentSummary.totalsByCurrency)) {
      sumVal = roundMoney(sumVal + group.totalCurrentValue);
      sumNet = roundMoney(sumNet + group.totalNetInvested);
      sumPnL = roundMoney(sumPnL + group.totalPnL);
    }
    totalCurrentValue = sumVal;
    totalNetInvested = sumNet;
    totalPnL = sumPnL;
    roiPercentage = sumNet > 0 ? roundMoney((sumPnL / sumNet) * 100) : 0;
  }

  const investments: DashboardInvestmentsSummaryDTO = {
    totalCurrentValue,
    totalNetInvested,
    totalPnL,
    roiPercentage,
    instrumentsCount,
  };

  const vehicles = {
    totalVehicles: vehiclesSummary.summary.totalVehicles,
    totalSpentPln: vehiclesSummary.summary.totalSpentPln,
    totalFuelSpentPln: vehiclesSummary.summary.totalFuelSpentPln,
    totalMaintenanceSpentPln: vehiclesSummary.summary.totalMaintenanceSpentPln,
    totalEquipmentSpentPln: vehiclesSummary.summary.totalEquipmentSpentPln,
  };

  const sports = {
    totalCostPln: sportStats.totalCostPln,
    totalEntries: sportStats.totalEntries,
    categoriesCount: sportStats.byCategory.length,
  };

  return {
    baseCurrency: baseCurrency as CurrencyCode,
    transactions: transactionsSummary,
    investments,
    vehicles,
    sports,
    recentTransactions: recentTransactionsResult.items,
  };
};
