import { startSession } from "mongoose";
import { NotFoundError } from "@utils/errors";
import { DeleteManyReply } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";


export const removeTransaction = async (id: string, refId?: string) => {
  const session = await startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const idsToDelete = refId ? [id, refId] : [id];
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
  return result! as DeleteManyReply;
}