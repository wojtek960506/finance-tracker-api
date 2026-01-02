import { RandomStandardTransaction } from "./types";
import { randomFromSet, randomNumber, weightedRandomFromSet } from "@utils/random";
import { ACCOUNTS, CURRENCIES, PAYMENT_METHODS, TRANSACTION_TYPES } from "@utils/consts";

export const prepareRandomStandardTransaction = (
  ownerId: string, date: Date, category: string, index: number,
): RandomStandardTransaction => {
  const amount = randomNumber(10, 10000);
  const currency = randomFromSet(CURRENCIES);
  const account = randomFromSet(ACCOUNTS);
  const transactionType = weightedRandomFromSet(
    TRANSACTION_TYPES,
    { "expense": 5, "income": 1 }
  )
  const paymentMethod = randomFromSet(PAYMENT_METHODS);
  const description = `${transactionType} - ${category} - ${amount} ${currency} ` +
    `- ${date.toISOString().slice(0,10)}`;
  
  return {
    date,
    description,
    amount,
    currency,
    category,
    transactionType,
    paymentMethod,
    account,
    sourceIndex: index,
    ownerId
  }
}
