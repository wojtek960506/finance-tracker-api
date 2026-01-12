import { startSession } from "mongoose";
import { TransactionModel } from "@models/transaction-model";
import { TransactionCreateStandardDTO } from "@schemas/transaction";
import { serializeTransaction } from "@schemas/serialize-transaction";


export type TransferTransactionProps = TransactionCreateStandardDTO & {
  ownerId: string,
  sourceIndex: number,
  sourceRefIndex: number,
};

export async function createTransferTransaction (
  expenseTransactionProps: TransferTransactionProps,
  incomeTransactionProps: TransferTransactionProps,
) {
  let expenseTransaction;
  let incomeTransaction;

  // TODO create helper method for such creation within session
  // as it appears also in `create-exchange-transaction-handler`

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
        { session, new: true },
      );
      incomeTransaction = await TransactionModel.findOneAndUpdate(
        { _id: incomeTransactionId },
        { refId: expenseTransactionId },
        { session, new: true },
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