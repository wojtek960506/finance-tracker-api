import { ClientSession } from 'mongoose';

import { TransactionModel } from '@transaction/model';
import { serializeTransaction } from '@transaction/serializers';

import {
  TransactionInvestmentCreateProps,
  TransactionStandardCreateProps,
} from './types';

export async function persistTransaction(
  props: TransactionStandardCreateProps | TransactionInvestmentCreateProps,
  session?: ClientSession,
) {
  const newTransaction = session
    ? (await TransactionModel.create([props], { session }))[0]
    : await TransactionModel.create(props);
  await newTransaction.populate([
    { path: 'categoryId', select: '_id type name' },
    { path: 'paymentMethodId', select: '_id type name' },
    { path: 'accountId', select: '_id type name' },
  ]);
  return serializeTransaction(newTransaction);
}
