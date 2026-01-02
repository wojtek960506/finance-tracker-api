import { ACCOUNTS, CURRENCIES } from "@utils/consts";
import { RandomExchangeTransactionPair } from "./types";
import { randomFromSet, randomNumber } from "@utils/random";


export const prepareRandomExchangeTransactionPair = (
  ownerId: string, date: Date, index: number,
): RandomExchangeTransactionPair => {
  const amountDebit = randomNumber(10,10000);
  const currencyDebit = randomFromSet(CURRENCIES);
  const amountCredit = randomNumber(10,10000);
  const currencyCredit = randomFromSet(CURRENCIES);
  const account = randomFromSet(ACCOUNTS);
  const paymentMethod = randomFromSet(new Set(["cash", "bankTransfer"]));

  let currencies;
  let exchangeRate;
  if (amountDebit > amountCredit) {
    exchangeRate = amountDebit / amountCredit;
    currencies = `${currencyCredit}/${currencyDebit}`;
  } else {
    exchangeRate = amountDebit / amountCredit;
    currencies = `${currencyCredit}/${currencyDebit}`;
  }
  const description = `${currencyDebit} -> ${currencyCredit}`;

  const commonProps = {
    category: "exchange",
    ownerId,
    date,
    account,
    paymentMethod,
    description,
    currencies,
    exchangeRate,
  }
  const debit = {
    ...commonProps,
    transactionType: "expense",
    amount: amountDebit,
    currency: currencyDebit,
    sourceIndex: index,
    sourceRefIndex: index + 1,
  }
  const credit = {
    ...commonProps,
    transactionType: "income",
    amount: amountCredit,
    currency: currencyCredit,
    sourceIndex: index + 1,
    sourceRefIndex: index,
  }
  return [debit, credit];
}