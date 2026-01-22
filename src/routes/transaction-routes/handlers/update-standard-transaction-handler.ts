import { FastifyReply, FastifyRequest } from "fastify";
import { updateStandardTransaction } from "@services/transactions";
import { TransactionUpdateStandardDTO } from "@schemas/transaction";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";


export const updateStandardTransactionHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId, Body: TransactionUpdateStandardDTO }>,
  res: FastifyReply,
) => {
  const updatedTransaction = await updateStandardTransaction(
    req.params.id,
    (req as AuthenticatedRequest).userId,
    req.body,
  )
  res.code(200).send(updatedTransaction);
}