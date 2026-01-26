import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { createExchangeTransaction } from "@services/transactions";
import { TransactionCreateExchangeDTO } from "@schemas/transaction";


export async function createExchangeTransactionHandler(
  req: FastifyRequest<{ Body: TransactionCreateExchangeDTO }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await createExchangeTransaction(req.body, userId);
  return res.code(201).send(result);
}
