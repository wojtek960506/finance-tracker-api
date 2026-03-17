import { CURRENCIES } from '@utils/consts';
import { randomFromSet, randomNumber } from '@utils/random';

import { RandomTransferTransactionPair } from '../types';

export const prepareRandomTransferTransactionPair = (
  ownerId: string,
  date: Date,
  index: number,
  categoryId: string,
  paymentMethodId: string,
  accountExpenseId: string,
  accountIncomeId: string,
): RandomTransferTransactionPair => {
  const amount = randomNumber(10, 10000);
  const currency = randomFromSet(CURRENCIES);

  const description = `Money Transfer: ${accountExpenseId} --> ${accountIncomeId}`;

  const commonProps = {
    date,
    amount,
    ownerId,
    currency,
    categoryId,
    description,
    paymentMethodId,
  };
  const expense = {
    ...commonProps,
    sourceIndex: index,
    accountId: accountExpenseId,
    sourceRefIndex: index + 1,
    transactionType: 'expense',
  };
  const income = {
    ...commonProps,
    sourceRefIndex: index,
    accountId: accountIncomeId,
    sourceIndex: index + 1,
    transactionType: 'income',
  };
  return [expense, income];
};
