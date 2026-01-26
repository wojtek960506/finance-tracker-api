import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { createTransferTransaction } from "@services/transactions";
import { TransactionCreateTransferDTO } from "@schemas/transaction";


export async function createTransferTransactionHandler(
  req: FastifyRequest<{ Body: TransactionCreateTransferDTO }>,
  res: FastifyReply,
) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await createTransferTransaction(req.body, userId);
  return res.code(201).send(result);
}
