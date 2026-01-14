import { ACCOUNTS, CURRENCIES } from "@utils/consts";
import { RandomTransferTransactionPair } from "./types";
import { randomFromSet, randomNumber } from "@utils/random";


export const prepareRandomTransferTransactionPair = (
  ownerId: string, date: Date, index: number,
): RandomTransferTransactionPair => {
  const amount = randomNumber(10, 10000);
  const currency = randomFromSet(CURRENCIES);
  const accountExpense = randomFromSet(ACCOUNTS);
  const accountIncome = randomFromSet(ACCOUNTS);
  const category = "myAccount";

  // TODO - when some rules for corelation between payment method and account will be added
  // then this have to be updated
  const paymentMethod = randomFromSet(new Set(["bankTransfer", "cash", "card"]));
  const description = `Money Transfer: ${accountExpense} --> ${accountIncome}`;

  const commonProps = {
    amount,
    currency,
    category,
    paymentMethod,
    description,
    ownerId,
    date,
  }
  const from = {
    ...commonProps,
    transactionType: "expense",
    account: accountExpense,
    sourceIndex: index,
    sourceRefIndex: index + 1,
  }
  const to = {
    ...commonProps,
    transactionType: "income",
    account: accountIncome,
    sourceIndex: index + 1,
    sourceRefIndex: index,
  }
  return [from, to];
}
