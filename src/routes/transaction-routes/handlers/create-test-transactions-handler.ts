import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { createTestTransactions } from "@services/transactions";
import { TestTransactionsCreateDTO } from "@schemas/transaction";


export const createTestTransactionsHandler = async (
  req: FastifyRequest<{ Body?: TestTransactionsCreateDTO }>,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const totalTransactions = req.body?.totalTransactions;
  const result = await createTestTransactions(ownerId, totalTransactions);
  return res.code(201).send(result);
}
