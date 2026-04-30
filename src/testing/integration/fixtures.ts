import { Types } from 'mongoose';

import { getNamedResourceModel } from '@named-resource';
import { USER_PASSWORD_HASH } from '@testing/factories/user/user-consts';
import { TransactionModel } from '@transaction/model';
import { UserModel } from '@user/model/user-model';
import {
  SYSTEM_ACCOUNT_NAMES,
  SYSTEM_CATEGORY_NAMES,
  SYSTEM_PAYMENT_METHOD_NAMES,
} from '@utils/consts';

const CategoryModel = getNamedResourceModel('category');
const PaymentMethodModel = getNamedResourceModel('paymentMethod');
const AccountModel = getNamedResourceModel('account');

export const createIntegrationUser = async (
  overrides: Partial<{
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
  }> = {},
) => {
  const userId = overrides._id ?? new Types.ObjectId();

  await UserModel.create({
    _id: userId,
    firstName: overrides.firstName ?? 'Test',
    lastName: overrides.lastName ?? 'User',
    email: overrides.email ?? `${userId.toString()}@example.com`,
    passwordHash: USER_PASSWORD_HASH,
  });

  return userId;
};

export const getSystemNamedResources = async () => {
  const [category, paymentMethod, account] = await Promise.all([
    CategoryModel.findOne({ type: 'system', name: [...SYSTEM_CATEGORY_NAMES][0] }),
    PaymentMethodModel.findOne({
      type: 'system',
      name: [...SYSTEM_PAYMENT_METHOD_NAMES][0],
    }),
    AccountModel.findOne({ type: 'system', name: [...SYSTEM_ACCOUNT_NAMES][0] }),
  ]);

  if (!category || !paymentMethod || !account) {
    throw new Error('System named resources are missing in integration test setup');
  }

  return { category, paymentMethod, account };
};

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
