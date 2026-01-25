import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import {
  TransactionExchangeDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from "@schemas/transaction";
import {
  createExchangeTransaction,
  createStandardTransaction,
  createTransferTransaction,
} from "@services/transactions";


export const createTransactionHandler = async (
  req: FastifyRequest<{
    Body: TransactionStandardDTO | TransactionExchangeDTO | TransactionTransferDTO
  }>,
  res: FastifyReply
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const dto = req.body;

  if ("currencyExpense" in dto) {
    return res.code(201).send(await createExchangeTransaction(dto, userId));
  } else if ("accountExpense" in dto) {
    return res.code(201).send(await createTransferTransaction(dto, userId));
  } else {
    return res.code(201).send(await createStandardTransaction(dto, userId));
  }
}