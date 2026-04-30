import { Types } from 'mongoose';

import { TransactionModel } from '@transaction/model';

type StandardTransactionInput = {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId;
  categoryId: Types.ObjectId;
  paymentMethodId: Types.ObjectId;
  accountId: Types.ObjectId;
  description?: string;
  amount?: number;
  currency?: string;
  date?: Date;
  transactionType?: 'expense' | 'income';
  sourceIndex?: number;
  deletion?: {
    deletedAt: Date;
    purgeAt: Date;
  } | null;
};

export const buildStandardTransactionDoc = ({
  _id = new Types.ObjectId(),
  ownerId,
  categoryId,
  paymentMethodId,
  accountId,
  description = 'Lunch',
  amount = 42.5,
  currency = 'PLN',
  date = new Date('2026-02-10T00:00:00.000Z'),
  transactionType = 'expense',
  sourceIndex = 1,
  deletion = null,
}: StandardTransactionInput) => ({
  _id,
  ownerId,
  date,
  description,
  amount,
  currency,
  categoryId,
  paymentMethodId,
  accountId,
  transactionType,
  sourceIndex,
  deletion,
});

export const insertTransactions = async (
  transactions: ReturnType<typeof buildStandardTransactionDoc>[],
) => TransactionModel.insertMany(transactions);
