import { FastifyReply, FastifyRequest } from "fastify";
import { TransactionUpdateDTO } from "@schemas/transaction";
import { updateStandardTransaction } from "@services/transactions";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";
import {
  AppError,
  NotFoundError,
  TransactionNotFoundError,
  TransactionOwnershipError,
} from "@utils/errors";


export const updateStandardTransactionHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId, Body: TransactionUpdateDTO }>,
  res: FastifyReply,
) => {
  try {
    const updatedTransaction = await updateStandardTransaction(
      req.params.id,
      (req as AuthenticatedRequest).userId,
      req.body,
    )
    res.code(200).send(updatedTransaction);
  } catch (err) {
    if (err instanceof TransactionNotFoundError) {
      throw new NotFoundError("Transaction not found by given ID");
    } else if (err instanceof TransactionOwnershipError) {
      throw new AppError(403, `Cannot update transaction which is not owned by the user`);
    } else {
      throw new AppError(500, "Internal server error");
    }
  }
}