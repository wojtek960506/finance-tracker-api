import { startSession } from "mongoose";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { getNextSourceIndex } from "@/services/get-next-source-index";
import {
  TransactionCreateStandardDTO,
  TransactionCreateTransferDTO,
} from "@schemas/transaction";

export async function createTransferTransactionHandler(
  req: FastifyRequest<{ Body: TransactionCreateTransferDTO }>,
  res: FastifyReply,
) {
  const userId = (req as AuthenticatedRequest).userId;
  const body = req.body;

  const fromIndexExpense = await getNextSourceIndex(userId);
  const toIndexExpense = await getNextSourceIndex(userId);

  // TODO for now `accountFrom` and `accountTo` are not translated in the body so
  // decide how to handle it
  let description = `${body.accountFrom} --> ${body.accountTo}`;
  if (body.additionalDescription) description += ` (${body.additionalDescription})`;

  const commonTransactionProps = {
    category: "myAccount",
    ownerId: userId,
    date: body.date,
    amount: body.amount,
    currency: body.currency,
    paymentMethod: body.paymentMethod,
    description,
  }

  type TransferTransactionProps = TransactionCreateStandardDTO & {
    sourceIndex: number,
    sourceRefIndex: number,
  };

  const fromTransactionProps: TransferTransactionProps = {
    ...commonTransactionProps,
    transactionType: "expense",
    account: body.accountFrom,
    sourceIndex: fromIndexExpense,
    sourceRefIndex: toIndexExpense,
  };

  const toTransactionProps: TransferTransactionProps = {
    ...commonTransactionProps,
    transactionType: "income",
    account: body.accountTo,
    sourceIndex: toIndexExpense,
    sourceRefIndex: fromIndexExpense,
  };

  let fromTransaction;
  let toTransaction;

  // TODO create helper method for such creation within session
  // as it appears also in `create-exchange-transaction-handler`

  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      const [
        { _id: fromTransactionId },
        { _id: toTransactionId },
      ] = await TransactionModel.create(
        [fromTransactionProps, toTransactionProps],
        { session, ordered: true }
      );

      fromTransaction = await TransactionModel.findOneAndUpdate(
        { _id: fromTransactionId },
        { refId: toTransactionId },
        { session, new: true },
      );
      toTransaction = await TransactionModel.findOneAndUpdate(
        { _id: toTransactionId },
        { refId: fromTransactionId },
        { session, new: true },
      );
    })
  } finally {
    await session.endSession();
  }

  return res.code(201).send([
    serializeTransaction(fromTransaction!),
    serializeTransaction(toTransaction!),
  ]);
}
