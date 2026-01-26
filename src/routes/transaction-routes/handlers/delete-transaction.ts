import { startSession } from "mongoose";
import { NotFoundError } from "@utils/errors";
import { FastifyReply, FastifyRequest } from "fastify";
import { TransactionModel } from "@models/transaction-model";
import { checkOwnerOld, findTransactionOld } from "@routes/routes-utils";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";


export async function deleteTransactionHandler(
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) {
  const transaction = await findTransactionOld(req.params.id);
  checkOwnerOld((req as AuthenticatedRequest).userId, transaction, "delete");    

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
          `There should be deletion of ${idsToDelete.length} transactions`
        );
      }
    })
  } finally {
    session.endSession()
  }

  return result;
}