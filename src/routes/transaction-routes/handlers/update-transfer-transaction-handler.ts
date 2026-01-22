import { FastifyReply, FastifyRequest } from "fastify";
import { updateTransferTransaction } from "@services/transactions";
import { TransactionUpdateTransferDTO } from "@schemas/transaction";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";


export const updateTransferTransactionHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId, Body: TransactionUpdateTransferDTO }>,
  res: FastifyReply,
) => {
  const updatedTransactions = await updateTransferTransaction(
    req.params.id,
    (req as AuthenticatedRequest).userId,
    req.body,
  )
  res.code(200).send(updatedTransactions);
}