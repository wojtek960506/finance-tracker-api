import { startSession } from "mongoose";
import { NotFoundError } from "@utils/errors";
import { ITransaction, TransactionModel } from "@models/transaction-model";


export const removeTransaction = async (transaction: ITransaction) => {
  const session = await startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const idsToDelete = transaction.refId
        ? [transaction._id, transaction.refId]
        : [transaction._id]

      result = await TransactionModel.deleteMany(
        { _id: { $in: idsToDelete }},
        { session }
      )

      if (result.deletedCount !== idsToDelete.length) {
        throw new NotFoundError(
          `Transaction(s) deleted - ${result.deletedCount}. ` +
          `Expected to be deleted - ${idsToDelete.length}.`
        );
      }
    })
  } finally {
    session.endSession()
  }
  return result;
}