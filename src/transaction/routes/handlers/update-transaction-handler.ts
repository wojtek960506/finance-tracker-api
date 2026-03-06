import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import {
  TransactionExchangeDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from '@transaction/schema';
import {
  updateExchangeTransaction,
  updateStandardTransaction,
  updateTransferTransaction,
} from '@transaction/services';

export const updateTransactionHandler = async (
  req: FastifyRequest<{
    Params: ParamsJustId;
    Body: TransactionStandardDTO | TransactionExchangeDTO | TransactionTransferDTO;
  }>,
  res: FastifyReply,
) => {
  const id = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const dto = req.body;

  if ('currencyExpense' in dto) {
    return res.code(200).send(await updateExchangeTransaction(id, userId, dto));
  } else if ('accountExpense' in dto) {
    return res.code(200).send(await updateTransferTransaction(id, userId, dto));
  } else {
    return res.code(200).send(await updateStandardTransaction(id, userId, dto));
  }
};
