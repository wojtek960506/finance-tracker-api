import { startSession } from "mongoose";
import { TransactionModel } from "@models/transaction-model";
import { TransactionCreateStandardDTO } from "@schemas/transaction";
import { serializeTransaction } from "@schemas/serialize-transaction";


export type ExchangeTransactionProps = TransactionCreateStandardDTO & {
  sourceIndex: number,
  sourceRefIndex: number
};

export async function createExchangeTransaction (
  expenseTransactionProps: ExchangeTransactionProps,
  incomeTransactionProps: ExchangeTransactionProps,
) {
  let expenseTransaction;
  let incomeTransaction;
  const session = await startSession();
  
  try {
    await session.withTransaction(async () => {
      const [
        { _id: expenseTransactionId },
        { _id: incomeTransactionId },
      ] = await TransactionModel.create(
        [expenseTransactionProps, incomeTransactionProps],
        { session, ordered: true }
      );
      
      expenseTransaction = await TransactionModel.findOneAndUpdate(
        { _id: expenseTransactionId },
        { refId: incomeTransactionId },
        { session, new: true }
      );
      incomeTransaction = await TransactionModel.findOneAndUpdate(
        { _id: incomeTransactionId },
        { refId: expenseTransactionId },
        { session, new: true }
      );
    })
  } finally {
    await session.endSession();
  }

  return [
    serializeTransaction(expenseTransaction!),
    serializeTransaction(incomeTransaction!),
  ]
}