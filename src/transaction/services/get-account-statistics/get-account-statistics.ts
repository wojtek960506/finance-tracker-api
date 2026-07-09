import { prepareNamedResourcesMap } from '@named-resource/services';
import { TransactionModel } from '@transaction/model';
import { TransactionAccountStatisticsQuery } from '@transaction/schema';
import { buildTransactionFilterQuery } from '@transaction/services';

import { USD_CURRENCY_CODE } from './constants';
import { fetchLatestRates } from './fetch-latest-rates';
import { parseAccountStatisticsResult } from './parse-account-statistics-result';
import { AccountBalanceStatisticsRow } from './types';
import { isValidCurrencyCode } from './utils';

export async function getAccountStatistics(
  q: TransactionAccountStatisticsQuery,
  userId: string,
) {
  const filter = buildTransactionFilterQuery(q, userId);

  const result = await TransactionModel.aggregate<AccountBalanceStatisticsRow>([
    { $match: filter },
    {
      $group: {
        _id: {
          accountId: '$accountId',
          currency: '$currency',
        },
        totalAmount: {
          $sum: {
            $cond: [
              { $eq: ['$transactionType', 'income'] },
              '$amount',
              { $multiply: ['$amount', -1] },
            ],
          },
        },
        totalItems: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.currency': 1,
        totalAmount: -1,
        '_id.accountId': 1,
      },
    },
  ]);

  const accountIds = [...new Set(result.map((item) => item._id.accountId.toString()))];
  const accountsMap = await prepareNamedResourcesMap('account', userId, accountIds);
  const normalizedBaseCurrency = isValidCurrencyCode(q.baseCurrency)
    ? q.baseCurrency
    : undefined;
  const latestRates = normalizedBaseCurrency
    ? await fetchLatestRates(
        [
          ...new Set(
            result.map((item) => item._id.currency).concat(normalizedBaseCurrency),
          ),
        ].filter((currency) => currency !== USD_CURRENCY_CODE),
      )
    : null;

  return parseAccountStatisticsResult({
    accountsMap,
    baseCurrency: normalizedBaseCurrency,
    latestRates: latestRates?.rates ?? null,
    result,
  });
}
