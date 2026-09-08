import { InvestmentOperationModel } from '@investment/model';
import { findInstrumentById } from '@investment/services';

import { persistTransaction } from '@transaction/db';
import { TransactionInvestmentDTO, TransactionResponseDTO } from '@transaction/schema';
import { getNextSourceIndex } from '@transaction/services';
import {
  resolveAccountId,
  resolveInvestmentCategoryId,
  resolvePaymentMethodId,
} from '@transaction/services/resolve-transaction-resource-id';
import { withSession } from '@utils/with-session';

export const createInvestmentTransaction = async (
  dto: TransactionInvestmentDTO,
  ownerId: string,
): Promise<TransactionResponseDTO> => {
  const [categoryId, paymentMethodId, accountId] = await Promise.all([
    resolveInvestmentCategoryId(dto.categoryId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
    resolveAccountId(dto.accountId, ownerId),
    findInstrumentById(ownerId, dto.investment.instrumentId),
  ]);

  const transactionType =
    dto.transactionType ??
    (dto.investment.operationKind === 'buy' || dto.investment.operationKind === 'fee'
      ? 'expense'
      : 'income');

  return withSession(async (session) => {
    const sourceIndex = await getNextSourceIndex(ownerId, session);

    const transaction = await persistTransaction(
      {
        amount: dto.amount,
        currency: dto.currency,
        date: dto.date,
        description: dto.description,
        transactionType,
        sourceIndex,
        ownerId,
        accountId,
        categoryId,
        paymentMethodId,
        kind: 'investment',
      },
      session,
    );

    await InvestmentOperationModel.create(
      [
        {
          ownerId,
          instrumentId: dto.investment.instrumentId,
          transactionId: transaction.id,
          kind: dto.investment.operationKind,
          amount: dto.amount,
          currency: dto.currency.toUpperCase(),
          date: dto.date,
          note: dto.investment.note,
        },
      ],
      { session },
    );

    return transaction;
  });
};
