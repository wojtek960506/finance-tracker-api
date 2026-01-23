import { FastifyReply, FastifyRequest } from "fastify";
import { TransactionUpdateExchangeDTO } from "@schemas/transaction";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";
import { updateExchangeTransaction } from "@services/transactions/update-exchange-transaction";


export const updateExchangeTransactionHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId, Body: TransactionUpdateExchangeDTO }>,
  res: FastifyReply,
) => {
  const updatedTransaction = await updateExchangeTransaction(
    req.params.id,
    (req as AuthenticatedRequest).userId,
    req.body,
  )
  return res.code(200).send(updatedTransaction);
}