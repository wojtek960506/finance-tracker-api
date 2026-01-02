import { CATEGORIES } from "@utils/consts";
import { randomDate, randomFromSet } from "@utils/random";
import { TransactionModel } from "@models/transaction-model";
import { prepareRandomStandardTransaction } from "./prepare-random-standard-transaction";
import { prepareRandomExchangeTransactionPair } from "./prepare-random-exchange-transaction-pair";
import { prepareRandomTransferTransactionPair } from "./prepare-random-transfer-transaction-pair";


export async function createRandomTransactions(
  ownerId: string,
  totalTransactions: number,
): Promise<number> {

  const startDate = new Date("2015-01-01");
  const endDate = new Date("2025-12-31");

  const randomTransactions = [];
  for (let i = 0; i < totalTransactions;) {
    const date = randomDate(startDate, endDate);
    const category = randomFromSet(CATEGORIES);

    if (category === "myAccount") {
      const [from, to] = prepareRandomTransferTransactionPair(ownerId, date, i);
      randomTransactions.push(from, to);
      i += 2;
    } else if (category === "exchange") {
      const [debit, credit] = prepareRandomExchangeTransactionPair(ownerId, date, i);
      randomTransactions.push(debit, credit);
      i += 2;
    } else {
      const transaction = prepareRandomStandardTransaction(ownerId, date, category, i);
      randomTransactions.push(transaction);
      i += 1;
    }
  }

  const result = await TransactionModel.insertMany(randomTransactions, { rawResult: true });

  // TODO add refId in transactions which have sourceRefIndex

  return result.insertedCount;
}