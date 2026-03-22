import { CURRENCY_CODES } from '@currency/schema';
import { TRANSACTION_TYPES } from '@utils/consts';
import { randomFromSet, randomNumber, weightedRandomFromSet } from '@utils/random';

import { RandomStandardTransaction } from '../types';

export const prepareRandomStandardTransaction = (
  ownerId: string,
  date: Date,
  index: number,
  categoryId: string,
  paymentMethodId: string,
  accountId: string,
): RandomStandardTransaction => {
  const amount = randomNumber(10, 10000);
  const currency = randomFromSet(new Set(CURRENCY_CODES));
  const transactionType = weightedRandomFromSet(TRANSACTION_TYPES, {
    expense: 5,
    income: 1,
  });
  const description =
    `${transactionType} - ${amount} ${currency} ` +
    `- ${date.toISOString().slice(0, 10)}`;

  return {
    date,
    amount,
    accountId,
    ownerId,
    currency,
    categoryId,
    description,
    paymentMethodId,
    transactionType,
    sourceIndex: index,
  };
};
