import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";
import {
  TransactionExchangeDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from "@schemas/transaction";
import {
  updateExchangeTransaction,
  updateStandardTransaction,
  updateTransferTransaction,
} from "@services/transactions";


export const updateTransactionHandler = async (
  req: FastifyRequest<{
    Params: ParamsJustId,
    Body: TransactionStandardDTO | TransactionExchangeDTO | TransactionTransferDTO
  }>,
  res: FastifyReply,
) => {
  const id = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const dto = req.body;
  
  if ("currencyExpense" in dto) {
    const result = await updateExchangeTransaction(id, userId, dto);
    return res.code(200).send(result);
  } else if ("accountExpense" in dto) {
    const result = await updateTransferTransaction(id, userId, dto);
    return res.code(200).send(result);
  } else {
    const result = await updateStandardTransaction(id, userId, dto);
    return res.code(200).send(result);
  }
}