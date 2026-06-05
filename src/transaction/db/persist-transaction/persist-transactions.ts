import { ClientSession } from 'mongoose';

import { TransactionModel } from '@transaction/model';
import { serializeTransaction } from '@transaction/serializers';
import { AppError } from '@utils/errors';
import { withSession } from '@utils/with-session';

import {
  TransactionExchangeCreateProps,
  TransactionStandardCreateProps,
  TransactionTransferCreateProps,
} from './types';

type TransactionCreateProps =
  | TransactionStandardCreateProps
  | TransactionTransferCreateProps
  | TransactionExchangeCreateProps;

const hasSourceRefIndex = (
  transaction: TransactionCreateProps,
): transaction is TransactionTransferCreateProps | TransactionExchangeCreateProps =>
  'sourceRefIndex' in transaction;

const POPULATE_TRANSACTION_PATHS = [
  { path: 'categoryId', select: '_id type name' },
  { path: 'paymentMethodId', select: '_id type name' },
  { path: 'accountId', select: '_id type name' },
];

const persistTransactionsCore = async (
  session: ClientSession,
  transactions: TransactionCreateProps[],
) => {
  const result = await TransactionModel.insertMany(transactions, {
    rawResult: true,
    session,
    ordered: true,
  });

  const insertedIds = Object.values(result.insertedIds);
  if (insertedIds.length !== transactions.length)
    throw new AppError(
      409,
      'Not all provided transactions were inserted',
      undefined,
      'TRANSACTIONS_BULK_INSERT_INCOMPLETE',
    );

  const sourceIndexToIdMap = Object.fromEntries(
    transactions.map((transaction, index) => [
      transaction.sourceIndex,
      insertedIds[index],
    ]),
  );

  const refIdUpdates = transactions.filter(hasSourceRefIndex).map((transaction) => ({
    id: sourceIndexToIdMap[transaction.sourceIndex],
    refId: sourceIndexToIdMap[transaction.sourceRefIndex],
  }));

  if (refIdUpdates.length > 0) {
    const updateResult = await TransactionModel.bulkWrite(
      refIdUpdates.map(({ id, refId }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { refId } },
        },
      })),
      { session },
    );

    if (updateResult.modifiedCount !== refIdUpdates.length)
      throw new AppError(
        409,
        'Not all inserted transactions were updated with reference ids',
        undefined,
        'TRANSACTIONS_BULK_REFERENCE_UPDATE_INCOMPLETE',
      );
  }

  const insertedTransactions = await TransactionModel.find({
    _id: { $in: insertedIds },
  })
    .session(session)
    .populate(POPULATE_TRANSACTION_PATHS);

  const transactionsById = new Map(
    insertedTransactions.map((transaction) => [transaction._id.toString(), transaction]),
  );

  return insertedIds.map((id) => {
    const transaction = transactionsById.get(id.toString());
    if (!transaction)
      throw new AppError(
        404,
        'Inserted transaction could not be loaded',
        undefined,
        'TRANSACTION_BULK_INSERTED_NOT_FOUND',
      );

    return serializeTransaction(transaction);
  });
};

export const persistTransactions = async (transactions: TransactionCreateProps[]) =>
  withSession(persistTransactionsCore, transactions);
