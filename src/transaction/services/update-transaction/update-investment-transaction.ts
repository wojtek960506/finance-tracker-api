import { InvestmentOperationModel } from '@investment/model';
import { findInstrumentById } from '@investment/services';

import { checkOwner } from '@shared/services';
import { findTransaction, saveTransactionChanges } from '@transaction/db';
import { TransactionInvestmentDTO, TransactionResponseDTO } from '@transaction/schema';
import {
  resolveAccountId,
  resolveInvestmentCategoryId,
  resolvePaymentMethodId,
} from '@transaction/services/resolve-transaction-resource-id';
import { withSession } from '@utils/with-session';

export const updateInvestmentTransaction = async (
  transactionId: string,
  ownerId: string,
  dto: TransactionInvestmentDTO,
): Promise<TransactionResponseDTO> => {
  const [categoryId, paymentMethodId, accountId] = await Promise.all([
    resolveInvestmentCategoryId(dto.categoryId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
    resolveAccountId(dto.accountId, ownerId),
    findInstrumentById(ownerId, dto.investment.instrumentId),
  ]);

  const transaction = await findTransaction(transactionId);
  checkOwner(ownerId, transactionId, transaction.ownerId, 'transaction');

  const transactionType =
    dto.transactionType ??
    (dto.investment.operationKind === 'buy' || dto.investment.operationKind === 'fee'
      ? 'expense'
      : 'income');

  return withSession(async (session) => {
    const updatedTransaction = await saveTransactionChanges(
      transaction,
      {
        amount: dto.amount,
        currency: dto.currency,
        date: dto.date,
        description: dto.description,
        transactionType,
        accountId,
        categoryId,
        paymentMethodId,
      },
      session,
    );

    await InvestmentOperationModel.findOneAndUpdate(
      { transactionId, ownerId },
      {
        instrumentId: dto.investment.instrumentId,
        kind: dto.investment.operationKind,
        amount: dto.amount,
        currency: dto.currency.toUpperCase(),
        date: dto.date,
        note: dto.investment.note,
      },
      { session, upsert: true },
    );

    return updatedTransaction;
  });
};
