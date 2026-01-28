import { FastifyReply, FastifyRequest } from "fastify";
import { TransactionModel } from "@models/transaction-model";


export const deleteAllTransactionsHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
) => res.code(200).send(await TransactionModel.deleteMany());
