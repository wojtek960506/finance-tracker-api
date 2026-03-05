import { FastifyReply, FastifyRequest } from "fastify";
import { getTransactions } from "@transaction/services";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionQuery } from "@transaction/schema";


export async function getTransactionsHandler (
  req: FastifyRequest<{ Querystring: TransactionQuery }>,
  res: FastifyReply,
) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getTransactions(req.query, userId);
  return res.code(200).send(result);
}