import {
  NetWorthIndependenceQuery,
  NetWorthIndependenceResponseDTO,
} from '@net-worth/schema';

import { CurrencyCode } from '@currency/schema';
import {
  fetchLatestRates,
  getCrossRate,
  isValidCurrencyCode,
  roundMoney,
  USD_CURRENCY_CODE,
} from '@currency/services';
import { findNamedResources } from '@named-resource/db';
import { TransactionModel } from '@transaction/model';
import { buildTransactionFilterQuery } from '@transaction/services';

import { getNetWorth } from './get-net-worth';

const DEFAULT_WORK_CATEGORY_REGEX =
  /(?:^|\b|\s)(?:praca|work|salary|wynagrodzenie|zarobki|etat|b2b)(?:\b|\s|$)/i;

// TODO split this file and analyze it further
export async function getFinancialIndependence(
  userId: string,
  query?: NetWorthIndependenceQuery,
): Promise<NetWorthIndependenceResponseDTO> {
  const baseCurrency = isValidCurrencyCode(query?.baseCurrency)
    ? (query.baseCurrency as CurrencyCode)
    : undefined;

  // 1. Resolve date window
  const periodMonths = query?.periodMonths ?? 12;
  const endDate = query?.endDate ? new Date(query.endDate) : new Date();
  const startDate = query?.startDate
    ? new Date(query.startDate)
    : new Date(
        endDate.getFullYear(),
        endDate.getMonth() - periodMonths,
        endDate.getDate(),
      );

  let monthsCount = periodMonths;
  if (query?.startDate || query?.endDate) {
    const diffTime = Math.max(endDate.getTime() - startDate.getTime(), 1);
    const days = diffTime / (1000 * 60 * 60 * 24);
    monthsCount = Math.max(roundMoney(days / 30.4375, 2), 0.01);
  }

  // 2. Fetch categories to detect/filter work categories
  const allCategories = await findNamedResources('category', userId);

  const hasExplicitExcludeIds = Boolean(
    query?.excludeCategoryIds && query.excludeCategoryIds.length > 0,
  );
  const hasExplicitExcludeNames = Boolean(
    query?.excludeCategoryNames && query.excludeCategoryNames.length > 0,
  );

  const excludedCategoryRecords = allCategories.filter((cat) => {
    if (hasExplicitExcludeIds || hasExplicitExcludeNames) {
      const matchesId =
        hasExplicitExcludeIds && query!.excludeCategoryIds!.includes(cat._id.toString());
      const matchesName =
        hasExplicitExcludeNames &&
        (() => {
          const normalizedQueryNames = query!.excludeCategoryNames!.map((n) =>
            n.trim().toLowerCase(),
          );
          return (
            normalizedQueryNames.includes(cat.nameNormalized.toLowerCase()) ||
            normalizedQueryNames.includes(cat.name.toLowerCase())
          );
        })();
      return Boolean(matchesId || matchesName);
    }
    return (
      DEFAULT_WORK_CATEGORY_REGEX.test(cat.nameNormalized) ||
      DEFAULT_WORK_CATEGORY_REGEX.test(cat.name)
    );
  });

  const excludedCategoryIdsSet = new Set(
    excludedCategoryRecords.map((cat) => cat._id.toString()),
  );

  // 3. Query current net worth and historical transactions in parallel
  // TODO we should think whether we always want to exclude those kinds
  const [netWorthResult, transactionRows] = await Promise.all([
    getNetWorth(userId, { baseCurrency }),
    TransactionModel.aggregate<{
      _id: {
        currency: string;
        transactionType: 'income' | 'expense';
        isExcludedCategory: boolean;
      };
      totalAmount: number;
    }>([
      {
        $match: {
          ...buildTransactionFilterQuery(
            {
              startDate,
              endDate,
            },
            userId,
          ),
          kind: { $nin: ['transfer', 'exchange', 'investment'] },
        },
      },
      {
        $group: {
          _id: {
            currency: '$currency',
            transactionType: '$transactionType',
            isExcludedCategory: {
              $in: [{ $toString: '$categoryId' }, Array.from(excludedCategoryIdsSet)],
            },
          },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  // Extract capital tiers
  const totalNetWorth = netWorthResult.netWorth.total;
  const liquidCash = netWorthResult.netWorth.liquidCash;
  const savings = netWorthResult.allocation.savings?.amount ?? 0;
  const liquidCapital = roundMoney(liquidCash + savings);
  const lockedInvestments = roundMoney(Math.max(0, totalNetWorth - liquidCapital));

  // 4. Convert transaction amounts to baseCurrency if applicable
  const distinctCurrencies = [...new Set(transactionRows.map((row) => row._id.currency))];

  let rates: Record<string, string> | null = null;
  if (baseCurrency) {
    const symbolsToFetch = [...new Set([...distinctCurrencies, baseCurrency])].filter(
      (c) => c !== USD_CURRENCY_CODE,
    );

    const latestRatesResponse = await fetchLatestRates(symbolsToFetch);
    rates = latestRatesResponse?.rates ?? null;
  }

  let totalExpenses = 0;
  let totalWorkIncome = 0;
  let totalNonWorkIncome = 0;

  for (const row of transactionRows) {
    const amount = row.totalAmount;
    let normalizedAmount = amount;

    if (baseCurrency) {
      const rate = getCrossRate(row._id.currency, baseCurrency, rates);
      if (rate !== null) {
        normalizedAmount = roundMoney(amount * rate);
      }
    }

    if (row._id.transactionType === 'expense') {
      if (!row._id.isExcludedCategory) {
        totalExpenses = roundMoney(totalExpenses + normalizedAmount);
      }
    } else if (row._id.transactionType === 'income') {
      if (row._id.isExcludedCategory) {
        totalWorkIncome = roundMoney(totalWorkIncome + normalizedAmount);
      } else {
        totalNonWorkIncome = roundMoney(totalNonWorkIncome + normalizedAmount);
      }
    }
  }

  const totalIncome = roundMoney(totalWorkIncome + totalNonWorkIncome);
  const grossExpenses = roundMoney(totalExpenses / monthsCount);
  const nonWorkIncome = roundMoney(totalNonWorkIncome / monthsCount);
  const workIncome = roundMoney(totalWorkIncome / monthsCount);
  const averageTotalIncome = roundMoney(totalIncome / monthsCount);
  const rawNetBurnRate = roundMoney(grossExpenses - nonWorkIncome);
  const netBurnRate = Math.max(0, rawNetBurnRate);

  // 5. Calculate Realistic Independence Horizons
  let isPerpetual = false;
  let netWorthMonths: number | null = null;
  let liquidCapitalMonths: number | null = null;
  let liquidCashMonths: number | null = null;

  if (rawNetBurnRate <= 0) {
    isPerpetual = true;
  } else {
    netWorthMonths = totalNetWorth > 0 ? roundMoney(totalNetWorth / netBurnRate, 2) : 0;
    liquidCapitalMonths =
      liquidCapital > 0 ? roundMoney(liquidCapital / netBurnRate, 2) : 0;
    liquidCashMonths = liquidCash > 0 ? roundMoney(liquidCash / netBurnRate, 2) : 0;
  }

  // 6. Calculate 0-Income Baseline
  let baselineNetWorthMonths: number | null = null;
  let baselineLiquidCapitalMonths: number | null = null;
  let baselineLiquidCashMonths: number | null = null;

  if (grossExpenses > 0) {
    baselineNetWorthMonths =
      totalNetWorth > 0 ? roundMoney(totalNetWorth / grossExpenses, 2) : 0;
    baselineLiquidCapitalMonths =
      liquidCapital > 0 ? roundMoney(liquidCapital / grossExpenses, 2) : 0;
    baselineLiquidCashMonths =
      liquidCash > 0 ? roundMoney(liquidCash / grossExpenses, 2) : 0;
  }

  const excludedCategories = excludedCategoryRecords.map((cat) => ({
    id: cat._id.toString(),
    name: cat.name,
  }));

  return {
    baseCurrency,
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      monthsCount,
    },
    netWorth: {
      total: totalNetWorth,
      liquidCash,
      savings,
      liquidCapital,
      lockedInvestments,
    },
    monthlyAverages: {
      grossExpenses,
      nonWorkIncome,
      workIncome,
      totalIncome: averageTotalIncome,
      netBurnRate,
    },
    independence: {
      netWorthMonths,
      liquidCapitalMonths,
      liquidCashMonths,
      isPerpetual,
    },
    zeroIncomeBaseline: {
      netWorthMonths: baselineNetWorthMonths,
      liquidCapitalMonths: baselineLiquidCapitalMonths,
      liquidCashMonths: baselineLiquidCashMonths,
    },
    excludedCategories,
  };
}
