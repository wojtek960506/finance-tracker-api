import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import {
  TransactionExchangeDTO,
  TransactionInvestmentDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from '@transaction/schema';
import {
  updateExchangeTransaction,
  updateInvestmentTransaction,
  updateStandardTransaction,
  updateTransferTransaction,
} from '@transaction/services';

export const updateTransactionHandler = async (
  req: FastifyRequest<{
    Params: ParamsJustId;
    Body:
      | TransactionStandardDTO
      | TransactionExchangeDTO
      | TransactionTransferDTO
      | TransactionInvestmentDTO;
  }>,
  res: FastifyReply,
) => {
  const id = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const dto = req.body;

  if ('investment' in dto) {
    return res
      .code(200)
      .send(
        await updateInvestmentTransaction(id, userId, dto as TransactionInvestmentDTO),
      );
  } else if ('currencyExpense' in dto) {
    return res
      .code(200)
      .send(await updateExchangeTransaction(id, userId, dto as TransactionExchangeDTO));
  } else if ('accountExpenseId' in dto) {
    return res
      .code(200)
      .send(await updateTransferTransaction(id, userId, dto as TransactionTransferDTO));
  } else {
    return res
      .code(200)
      .send(await updateStandardTransaction(id, userId, dto as TransactionStandardDTO));
  }
};
