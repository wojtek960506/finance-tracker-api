import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { prepareTransferProps } from "./prepare-transfer-props";
import { TransactionCreateTransferDTO } from "@schemas/transaction";
import { createTransferTransaction, getNextSourceIndex } from "@/services/transactions";


export async function createTransferTransactionHandler(
  req: FastifyRequest<{ Body: TransactionCreateTransferDTO }>,
  res: FastifyReply,
) {
  const userId = (req as AuthenticatedRequest).userId;
  const body = req.body;

  const sourceIndexFrom = await getNextSourceIndex(userId);
  const sourceIndexTo = await getNextSourceIndex(userId);

  const {
    fromTransactionProps,
    toTransactionProps,
  } = prepareTransferProps(body, userId, sourceIndexFrom, sourceIndexTo);

  const [
    fromTransaction,
    toTransaction,
  ] = await createTransferTransaction(fromTransactionProps, toTransactionProps);

  return res.code(201).send([fromTransaction, toTransaction]);
}
