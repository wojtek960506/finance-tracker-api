import { ClientSession } from "mongoose";
import { NotFoundError } from "@utils/errors";
import { withSession } from "@utils/with-session";
import { DeleteManyReply } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";


export const removeTransactionCore = async (
  session: ClientSession,
  id: string,
  refId?: string,
): Promise<DeleteManyReply> => {
  const idsToDelete = refId ? [id, refId] : [id];
  const result = await TransactionModel.deleteMany(
    { _id: { $in: idsToDelete }},
    { session }
  )

  if (result.deletedCount !== idsToDelete.length) {
    throw new NotFoundError(
      `Transaction(s) deleted - ${result.deletedCount}. ` +
      `Expected to be deleted - ${idsToDelete.length}.`
    );
  }

  return result;
}

export const removeTransaction = async (
  id: string,
  refId?: string
): Promise<DeleteManyReply> => (
  withSession(removeTransactionCore, id, refId)
);
