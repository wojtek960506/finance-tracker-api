import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@shared/http";
import { createTestTransactions } from "@transaction/services";
import { TestTransactionsCreateDTO } from "@transaction/schema";


export const createTestTransactionsHandler = async (
  req: FastifyRequest<{ Body?: TestTransactionsCreateDTO }>,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const totalTransactions = req.body?.totalTransactions;
  const result = await createTestTransactions(ownerId, totalTransactions);
  return res.code(201).send(result);
}
