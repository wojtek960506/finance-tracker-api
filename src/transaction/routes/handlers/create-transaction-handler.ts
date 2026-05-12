import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';
import {
  TransactionExchangeDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from '@transaction/schema';
import {
  createExchangeTransaction,
  createStandardTransaction,
  createTransferTransaction,
} from '@transaction/services';

export const createTransactionHandler = async (
  req: FastifyRequest<{
    Body: TransactionStandardDTO | TransactionExchangeDTO | TransactionTransferDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const dto = req.body;

  if ('currencyExpense' in dto) {
    return res
      .code(201)
      .send(await createExchangeTransaction(dto as TransactionExchangeDTO, userId));
  } else if ('accountExpenseId' in dto) {
    return res
      .code(201)
      .send(await createTransferTransaction(dto as TransactionTransferDTO, userId));
  } else {
    return res
      .code(201)
      .send(await createStandardTransaction(dto as TransactionStandardDTO, userId));
  }
};
