import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { prepareExchangeProps } from "./prepare-exchange-props";
import { TransactionCreateExchangeDTO } from "@schemas/transaction";
import { createExchangeTransaction, getNextSourceIndex } from "@/services/transactions";


export async function createExchangeTransactionHandler(
  req: FastifyRequest<{ Body: TransactionCreateExchangeDTO }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId;
  const body = req.body;

  const sourceIndexExpense = await getNextSourceIndex(userId);
  const sourceIndexIncome = await getNextSourceIndex(userId);

  const { expenseTransactionProps, incomeTransactionProps } = prepareExchangeProps(
    body, userId, sourceIndexExpense, sourceIndexIncome
  );

  const [ expenseTransaction, incomeTransaction ] = await createExchangeTransaction(
    expenseTransactionProps, incomeTransactionProps
  );

  return res.code(201).send([expenseTransaction, incomeTransaction]);
}
