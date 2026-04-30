import { Document, model, Schema, Types } from 'mongoose';

import { CURRENCY_CODES } from '@currency/schema';
import { TRANSACTION_TYPES } from '@utils/consts';

export interface TransactionAttributes {
  date: Date;
  description: string;
  amount: number;
  currency: string;
  categoryId: Types.ObjectId;
  paymentMethodId: Types.ObjectId;
  accountId: Types.ObjectId;
  transactionType: 'income' | 'expense';
  createdAt: Date;
  updatedAt: Date;
  exchangeRate?: number;
  currencies?: string;
  sourceIndex: number;
  sourceRefIndex?: number;
  deletion?: TransactionDeletion | null;
}

export interface TransactionDeletion {
  deletedAt: Date;
  purgeAt: Date;
}

export interface ITransaction extends TransactionAttributes, Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  refId: Types.ObjectId;
}

const transactionDeletionSchema = new Schema<TransactionDeletion>(
  {
    deletedAt: { type: Date, required: true },
    purgeAt: { type: Date, required: true },
  },
  { _id: false },
);

const transactionSchema = new Schema<ITransaction>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      enums: [...CURRENCY_CODES],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    paymentMethodId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentMethod',
      required: true,
      index: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    transactionType: { type: String, required: true, enum: [...TRANSACTION_TYPES] },
    exchangeRate: { type: Number, required: false },
    currencies: { type: String, required: false },
    sourceIndex: { type: Number, required: true },
    sourceRefIndex: { type: Number, required: false },
    refId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      required: false,
      index: true,
    },
    deletion: {
      type: transactionDeletionSchema,
      required: false,
      default: null,
    },
  },
  { timestamps: true },
);

transactionSchema.index({ ownerId: 1, 'deletion.deletedAt': -1 });

export const TransactionModel = model<ITransaction>('Transaction', transactionSchema);
