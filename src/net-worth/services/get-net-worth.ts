import { getInvestmentSummary } from '@investment/services';
import { NetWorthCategory } from '@net-worth/consts';
import {
  NetWorthAllocationItemDTO,
  NetWorthCurrencyBreakdownDTO,
  NetWorthQuery,
  NetWorthResponseDTO,
} from '@net-worth/schema';

import { CurrencyCode } from '@currency/schema';
import {
  fetchLatestRates,
  getCrossRate,
  isValidCurrencyCode,
  roundMoney,
  USD_CURRENCY_CODE,
} from '@currency/services';
import { TransactionModel } from '@transaction/model';
import { buildTransactionFilterQuery } from '@transaction/services';

// TODO maybe split this file a little
export async function getNetWorth(
  userId: string,
  query?: NetWorthQuery,
): Promise<NetWorthResponseDTO> {
  const [cashRows, investmentSummary] = await Promise.all([
    TransactionModel.aggregate<{ _id: { currency: string }; totalAmount: number }>([
      { $match: buildTransactionFilterQuery({}, userId) },
      {
        $group: {
          _id: { currency: '$currency' },
          totalAmount: {
            $sum: {
              $cond: [
                { $eq: ['$transactionType', 'income'] },
                '$amount',
                { $multiply: ['$amount', -1] },
              ],
            },
          },
        },
      },
    ]),
    getInvestmentSummary(userId, query),
  ]);

  const cashByCurrency: Record<string, number> = {};
  for (const row of cashRows) {
    cashByCurrency[row._id.currency] = roundMoney(row.totalAmount);
  }

  const investmentsByCurrency: Record<string, number> = {};
  for (const [curr, summary] of Object.entries(investmentSummary.totalsByCurrency)) {
    investmentsByCurrency[curr] = summary.totalCurrentValue;
  }

  const allCurrencies = [
    ...new Set([...Object.keys(cashByCurrency), ...Object.keys(investmentsByCurrency)]),
  ].sort();

  const baseCurrency = isValidCurrencyCode(query?.baseCurrency)
    ? (query.baseCurrency as CurrencyCode)
    : undefined;

  let rates: Record<string, string> | null = null;

  if (baseCurrency) {
    const symbolsToFetch = [...new Set([...allCurrencies, baseCurrency])].filter(
      (c) => c !== USD_CURRENCY_CODE,
    );

    const latestRatesResponse = await fetchLatestRates(symbolsToFetch);
    rates = latestRatesResponse?.rates ?? null;
  }

  const byCurrency: Record<string, NetWorthCurrencyBreakdownDTO> = {};
  let totalLiquidCash = 0;
  let totalInvestments = 0;

  for (const curr of allCurrencies) {
    const cash = cashByCurrency[curr] ?? 0;
    const investments = investmentsByCurrency[curr] ?? 0;
    const total = roundMoney(cash + investments);

    let normalizedTotal: number | undefined;

    if (baseCurrency) {
      const rate = getCrossRate(curr, baseCurrency, rates);
      if (rate !== null) {
        normalizedTotal = roundMoney(total * rate);
        totalLiquidCash = roundMoney(totalLiquidCash + cash * rate);
        totalInvestments = roundMoney(totalInvestments + investments * rate);
      } else {
        totalLiquidCash = roundMoney(totalLiquidCash + cash);
        totalInvestments = roundMoney(totalInvestments + investments);
      }
    } else {
      totalLiquidCash = roundMoney(totalLiquidCash + cash);
      totalInvestments = roundMoney(totalInvestments + investments);
    }

    byCurrency[curr] = {
      currency: curr as CurrencyCode,
      cash,
      investments,
      total,
      normalizedTotal,
    };
  }

  const totalNetWorth = roundMoney(totalLiquidCash + totalInvestments);

  // Calculate allocation
  const allocationAmounts: Record<NetWorthCategory, number> = {
    cash: totalLiquidCash,
    share: 0,
    fund: 0,
    termDeposit: 0,
    savings: 0,
  };

  for (const instrument of investmentSummary.instruments) {
    const kind = instrument.kind as NetWorthCategory;
    let normValue = instrument.currentValue;

    if (baseCurrency) {
      const rate = getCrossRate(instrument.currency, baseCurrency, rates);
      if (rate !== null) {
        normValue = roundMoney(instrument.currentValue * rate);
      }
    }

    if (allocationAmounts[kind] !== undefined) {
      allocationAmounts[kind] = roundMoney(allocationAmounts[kind] + normValue);
    }
  }

  const allocation: Record<string, NetWorthAllocationItemDTO> = {};
  const categories: NetWorthCategory[] = [
    'cash',
    'share',
    'fund',
    'termDeposit',
    'savings',
  ];

  let hasAnyAllocation = false;
  for (const category of categories) {
    const amount = allocationAmounts[category];
    if (amount > 0) {
      hasAnyAllocation = true;
      const percentage =
        totalNetWorth > 0 ? roundMoney((amount / totalNetWorth) * 100) : 0;
      allocation[category] = {
        category,
        amount,
        percentage,
      };
    }
  }

  if (!hasAnyAllocation) {
    allocation.cash = {
      category: 'cash',
      amount: 0,
      percentage: 0,
    };
  }

  return {
    baseCurrency,
    netWorth: {
      total: totalNetWorth,
      liquidCash: totalLiquidCash,
      investments: totalInvestments,
    },
    byCurrency,
    allocation,
  };
}
