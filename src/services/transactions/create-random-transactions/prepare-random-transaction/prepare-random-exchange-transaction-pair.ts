import { ACCOUNTS, CURRENCIES } from "@utils/consts";
import { RandomExchangeTransactionPair } from "../types";
import { randomFromSet, randomNumber } from "@utils/random";


export const prepareRandomExchangeTransactionPair = (
  ownerId: string, date: Date, index: number, categoryId: string,
): RandomExchangeTransactionPair => {
  const amountExpense = randomNumber(10,10000);
  const currencyExpense = randomFromSet(CURRENCIES);
  const amountIncome = randomNumber(10,10000);
  const currencyIncome = randomFromSet(CURRENCIES);
  const account = randomFromSet(ACCOUNTS);
  const paymentMethod = randomFromSet(new Set(["cash", "bankTransfer"]));

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
    account,
    ownerId,
    currencies,
    categoryId,
    description,
    exchangeRate,
    paymentMethod,
  }
  const expense = {
    ...commonProps,
    sourceIndex: index,
    amount: amountExpense,
    currency: currencyExpense,
    sourceRefIndex: index + 1,
    transactionType: "expense",
  }
  const income = {
    ...commonProps,
    amount: amountIncome,
    sourceRefIndex: index,
    sourceIndex: index + 1,
    currency: currencyIncome,
    transactionType: "income",
  }
  return [expense, income];
}