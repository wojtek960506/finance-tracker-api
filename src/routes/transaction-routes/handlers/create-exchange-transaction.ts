import { startSession } from "mongoose";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";
import { getNextSourceIndex } from "@/services/transactions";
import { serializeTransaction } from "@schemas/serialize-transaction";
import {
  TransactionCreateStandardDTO,
  TransactionCreateExchangeDTO,
} from "@schemas/transaction";


export async function createExchangeTransactionHandler(
  req: FastifyRequest<{ Body: TransactionCreateExchangeDTO }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId;
  const body = req.body;

  const sourceIndexExpense = await getNextSourceIndex(userId);
  const sourceIndexIncome = await getNextSourceIndex(userId);

  let currencies;
  let exchangeRate;
  if (body.amountExpense > body.amountIncome) {
    exchangeRate = body.amountExpense / body.amountIncome;
    currencies = `${body.currencyIncome}/${body.currencyExpense}`;
  } else {
    exchangeRate = body.amountIncome / body.amountExpense;
    currencies = `${body.currencyExpense}/${body.currencyIncome}`;
  }
  
  let description = `${body.currencyExpense} -> ${body.currencyIncome}`;
  if (body.additionalDescription) description += ` (${body.additionalDescription})`;

  const commonTransactionProps = {
    category: "exchange",
    ownerId: userId,
    date: body.date,
    account: body.account,
    paymentMethod: body.paymentMethod,
    description,
    currencies,
    exchangeRate,
  }

  type ExchangeTransactionProps = TransactionCreateStandardDTO & {
    sourceIndex: number,
    sourceRefIndex: number
  };

  const expenseTransactionProps: ExchangeTransactionProps = {
    ...commonTransactionProps,
    transactionType: "expense",
    amount: body.amountExpense,
    currency: body.currencyExpense,
    sourceIndex: sourceIndexExpense,
    sourceRefIndex: sourceIndexIncome,
  }

  const incomeTransactionProps: ExchangeTransactionProps = {
    ...commonTransactionProps,
    transactionType: "income",
    amount: body.amountIncome,
    currency: body.currencyIncome,
    sourceIndex: sourceIndexIncome,
    sourceRefIndex: sourceIndexExpense,
  }

  let expenseTransaction;
  let incomeTransaction;
  const session = await startSession();
  
  try {
    await session.withTransaction(async () => {
      const [
        { _id: expenseTransactionId },
        { _id: incomeTransactionId },
      ] = await TransactionModel.create(
        [expenseTransactionProps, incomeTransactionProps],
        { session, ordered: true }
      );
      
      expenseTransaction = await TransactionModel.findOneAndUpdate(
        { _id: expenseTransactionId },
        { refId: incomeTransactionId },
        { session, new: true }
      );
      incomeTransaction = await TransactionModel.findOneAndUpdate(
        { _id: incomeTransactionId },
        { refId: expenseTransactionId },
        { session, new: true }
      );
    })
  } finally {
    await session.endSession();
  }

  return res.code(201).send([
    serializeTransaction(expenseTransaction!),
    serializeTransaction(incomeTransaction!),
  ])
}
