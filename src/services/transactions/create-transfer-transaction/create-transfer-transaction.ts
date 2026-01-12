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
  fromTransactionProps: TransferTransactionProps,
  toTransactionProps: TransferTransactionProps,
) {
  let fromTransaction;
  let toTransaction;

  // TODO create helper method for such creation within session
  // as it appears also in `create-exchange-transaction-handler`

  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      const [
        { _id: fromTransactionId },
        { _id: toTransactionId },
      ] = await TransactionModel.create(
        [fromTransactionProps, toTransactionProps],
        { session, ordered: true }
      );

      fromTransaction = await TransactionModel.findOneAndUpdate(
        { _id: fromTransactionId },
        { refId: toTransactionId },
        { session, new: true },
      );
      toTransaction = await TransactionModel.findOneAndUpdate(
        { _id: toTransactionId },
        { refId: fromTransactionId },
        { session, new: true },
      );
    })
  } finally {
    await session.endSession();
  }

  return [
    serializeTransaction(fromTransaction!),
    serializeTransaction(toTransaction!),
  ]
}