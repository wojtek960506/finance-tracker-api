import { prepareNamedResourcesMap } from '@named-resource/services';
import { TransactionModel } from '@transaction/model';
import { TransactionAccountStatisticsQuery } from '@transaction/schema';
import { buildTransactionFilterQuery } from '@transaction/services';

type AccountBalanceStatisticsRow = {
  _id: {
    accountId: { toString: () => string };
    currency: string;
  };
  totalAmount: number;
  totalItems: number;
};

const roundMoney = (value: number) => {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;

  return Object.is(rounded, -0) ? 0 : rounded;
};

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

  const currencies = Object.values(
    result.reduce<Record<string, { currency: string; accounts: any[] }>>((acc, item) => {
      const accountId = item._id.accountId.toString();
      const currency = item._id.currency;

      if (!acc[currency]) {
        acc[currency] = {
          currency,
          accounts: [],
        };
      }

      acc[currency].accounts.push({
        accountId,
        accountName: accountsMap[accountId]?.name ?? accountId,
        accountType: accountsMap[accountId]?.type ?? 'user',
        totalAmount: roundMoney(item.totalAmount),
        totalItems: item.totalItems,
      });

      return acc;
    }, {}),
  )
    .map((currency) => ({
      ...currency,
      accounts: currency.accounts.sort(
        (left, right) =>
          right.totalAmount - left.totalAmount ||
          left.accountName.localeCompare(right.accountName),
      ),
    }))
    .sort((left, right) => left.currency.localeCompare(right.currency));

  return { currencies };
}
