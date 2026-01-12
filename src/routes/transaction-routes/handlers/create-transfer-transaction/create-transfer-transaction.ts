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

  const sourceIndexExpense = await getNextSourceIndex(userId);
  const sourceIndexIncome = await getNextSourceIndex(userId);

  const {
    expenseTransactionProps,
    incomeTransactionProps,
  } = prepareTransferProps(body, userId, sourceIndexExpense, sourceIndexIncome);

  const [
    fromTransaction,
    toTransaction,
  ] = await createTransferTransaction(expenseTransactionProps, incomeTransactionProps);

  return res.code(201).send([fromTransaction, toTransaction]);
}
