import { RandomStandardTransaction } from "../types"
import { ACCOUNTS, CURRENCIES, TRANSACTION_TYPES } from "@utils/consts"
import { randomNumber, randomFromSet, weightedRandomFromSet } from "@utils/random"


export const prepareRandomStandardTransaction = (
  ownerId: string,
  date: Date,
  index: number,
  categoryId: string,
  paymentMethodId: string,
): RandomStandardTransaction => {
  const amount = randomNumber(10, 10000);
  const currency = randomFromSet(CURRENCIES);
  const account = randomFromSet(ACCOUNTS);
  const transactionType = weightedRandomFromSet(
    TRANSACTION_TYPES,
    { "expense": 5, "income": 1 }
  )
  const description = `${transactionType} - ${amount} ${currency} ` +
    `- ${date.toISOString().slice(0,10)}`;
  
  return {
    date,
    amount,
    account,
    ownerId,
    currency,
    categoryId,
    description,
    paymentMethodId,
    transactionType,
    sourceIndex: index,
  }
}
