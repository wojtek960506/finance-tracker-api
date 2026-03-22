import { CURRENCY_CODES } from '@currency/schema';
import { randomFromSet, randomNumber } from '@utils/random';

import { RandomExchangeTransactionPair } from '../types';

export const prepareRandomExchangeTransactionPair = (
  ownerId: string,
  date: Date,
  index: number,
  categoryId: string,
  paymentMethodId: string,
  accountId: string,
): RandomExchangeTransactionPair => {
  const amountExpense = randomNumber(10, 10000);
  const currencyExpense = randomFromSet(new Set(CURRENCY_CODES));
  const amountIncome = randomNumber(10, 10000);
  const currencyIncome = randomFromSet(new Set(CURRENCY_CODES));

  let currencies;
  let exchangeRate;
  if (amountExpense > amountIncome) {
    exchangeRate = amountExpense / amountIncome;
    currencies = `${currencyIncome}/${currencyExpense}`;
  } else {
    exchangeRate = amountExpense / amountIncome;
    currencies = `${currencyIncome}/${currencyExpense}`;
  }
  const description = `${currencyExpense} -> ${currencyIncome}`;

  const commonProps = {
    date,
    accountId,
    ownerId,
    currencies,
    categoryId,
    description,
    exchangeRate,
    paymentMethodId,
  };
  const expense = {
    ...commonProps,
    sourceIndex: index,
    amount: amountExpense,
    currency: currencyExpense,
    sourceRefIndex: index + 1,
    transactionType: 'expense',
  };
  const income = {
    ...commonProps,
    amount: amountIncome,
    sourceRefIndex: index,
    sourceIndex: index + 1,
    currency: currencyIncome,
    transactionType: 'income',
  };
  return [expense, income];
};
