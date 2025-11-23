import { TransactionModel } from "@models/transaction-model";
import { AuthenticatedRequest, ParamsJustId } from "@routes/types";
import { TransactionPatchDTO, TransactionUpdateDTO } from "@schemas/transaction";
import { FastifyRequest } from "fastify";
import { AppError, NotFoundError } from "./errors";
import { serializeTransaction } from "@schemas/serialize-transaction";

export const updateTransactionHelper = async (
  req: FastifyRequest<{
    Params: ParamsJustId;
    Body: TransactionUpdateDTO | TransactionPatchDTO
  }>
) => {
  const { id } = req.params;
  const userId = (req as AuthenticatedRequest).userId;

  const transaction = await TransactionModel.findById(id);

  if (!transaction)
    throw new NotFoundError(`Transaction with ID '${id}' not found`);

  if (transaction.ownerId.toString() !== userId)
    throw new AppError(403, "Cannot update transaction which you are now owning");

  Object.assign(transaction, req.body);
  await transaction.save();

  return serializeTransaction(transaction);
}
