import { ACCOUNTS, CURRENCIES } from "@utils/consts";
import { RandomTransferTransactionPair } from "../types";
import { randomFromSet, randomNumber } from "@utils/random";


export const prepareRandomTransferTransactionPair = (
  ownerId: string, date: Date, index: number, categoryId: string,
): RandomTransferTransactionPair => {
  const amount = randomNumber(10, 10000);
  const currency = randomFromSet(CURRENCIES);
  const accountExpense = randomFromSet(ACCOUNTS);
  const accountIncome = randomFromSet(ACCOUNTS);

  // TODO - when some rules for corelation between payment method and account will be added
  // then this have to be updated
  const paymentMethod = randomFromSet(new Set(["bankTransfer", "cash", "card"]));
  const description = `Money Transfer: ${accountExpense} --> ${accountIncome}`;

  const commonProps = {
    date,
    amount,
    ownerId,
    currency,
    categoryId,
    description,
    paymentMethod,
  }
  const expense = {
    ...commonProps,
    sourceIndex: index,
    account: accountExpense,
    sourceRefIndex: index + 1,
    transactionType: "expense",
  }
  const income = {
    ...commonProps,
    sourceRefIndex: index,
    account: accountIncome,
    sourceIndex: index + 1,
    transactionType: "income",
  }
  return [expense, income];
}
