import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { getNextSourceIndex } from "@/services/transactions";
import { prepareTransferProps } from "./prepare-transfer-props";
import { TransactionCreateTransferDTO } from "@schemas/transaction";
import { persistTransferTransaction } from "@db/transactions/persist-transaction";


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
  ] = await persistTransferTransaction(expenseTransactionProps, incomeTransactionProps);

  return res.code(201).send([fromTransaction, toTransaction]);
}
