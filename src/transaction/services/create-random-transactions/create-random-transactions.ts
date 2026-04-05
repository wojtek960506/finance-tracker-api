import { ClientSession } from 'mongoose';

import { getOrCreateNamedResource } from '@shared/named-resource/services';
import { TransactionModel } from '@transaction/model';
import {
  SYSTEM_ACCOUNT_NAMES,
  SYSTEM_CATEGORY_NAMES,
  SYSTEM_PAYMENT_METHOD_NAMES,
} from '@utils/consts';
import { AppError } from '@utils/errors';
import { randomDate, randomFromSet } from '@utils/random';
import { excludeFromSet } from '@utils/set';

import {
  prepareRandomExchangeTransactionPair,
  prepareRandomStandardTransaction,
  prepareRandomTransferTransactionPair,
} from './prepare-random-transaction';
import { RandomTransaction } from './types';

export async function createRandomTransactions(
  ownerId: string,
  totalTransactions: number,
  session?: ClientSession,
): Promise<number> {
  const startDate = new Date('2015-01-01');
  const endDate = new Date('2025-12-31');

  // create some categories
  const testCategoryNames = [
    ...SYSTEM_CATEGORY_NAMES,
    'Food',
    'Sport',
    'Transport',
    'Accomodation',
    'Entertainment',
  ];
  const testPaymentMethodNames = [...SYSTEM_PAYMENT_METHOD_NAMES, 'BLIK'];
  const testAccountNames = [...SYSTEM_ACCOUNT_NAMES, 'wallet', 'bank'];

  const categories = (
    await Promise.all(
      testCategoryNames.map((name) =>
        getOrCreateNamedResource('category', ownerId, name),
      ),
    )
  ).filter((c) => c != undefined);
  const categoryIds = categories.map((c) => c.id);
  const categoryNamesMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const paymentMethods = (
    await Promise.all(
      testPaymentMethodNames.map((name) =>
        getOrCreateNamedResource('paymentMethod', ownerId, name),
      ),
    )
  ).filter((pm) => pm != undefined);
  const paymentMethodIds = paymentMethods.map((pm) => pm.id);
  const accounts = (
    await Promise.all(
      testAccountNames.map((name) => getOrCreateNamedResource('account', ownerId, name)),
    )
  ).filter((account) => account != undefined);
  const accountIds = new Set(accounts.map((account) => account.id));

  const randomTransactions: RandomTransaction[] = [];
  for (let i = 0; i < totalTransactions; ) {
    const date = randomDate(startDate, endDate);

    const categoryId = randomFromSet(new Set(categoryIds));
    const paymentMethodId = randomFromSet(new Set(paymentMethodIds));
    const accountId1 = randomFromSet(new Set(accountIds));
    const accountId2 = randomFromSet(excludeFromSet(new Set(accountIds), [accountId1]));

    if (categoryNamesMap[categoryId] === 'myAccount') {
      const [expense, income] = prepareRandomTransferTransactionPair(
        ownerId,
        date,
        i,
        categoryId,
        paymentMethodId,
        accountId1,
        accountId2,
      );
      randomTransactions.push(expense, income);
      i += 2;
    } else if (categoryNamesMap[categoryId] === 'exchange') {
      const [expense, income] = prepareRandomExchangeTransactionPair(
        ownerId,
        date,
        i,
        categoryId,
        paymentMethodId,
        accountId1,
      );
      randomTransactions.push(expense, income);
      i += 2;
    } else {
      const transaction = prepareRandomStandardTransaction(
        ownerId,
        date,
        i,
        categoryId,
        paymentMethodId,
        accountId1,
      );
      randomTransactions.push(transaction);
      i += 1;
    }
  }

  const result = await TransactionModel.insertMany(randomTransactions, {
    rawResult: true,
    session,
  });

  const insertedIds = Object.values(result.insertedIds);
  const sourceIndices = randomTransactions.map((t) => t.sourceIndex);
  if (insertedIds.length !== sourceIndices.length)
    throw new AppError(
      409,
      'Not all provided transactions were inserted',
      undefined,
      'RANDOM_TRANSACTIONS_INSERT_INCOMPLETE',
    );

  const sourceIndicesToIdsMap = Object.fromEntries(
    sourceIndices.map((idx, i) => [idx, insertedIds[i]]),
  );

  // get pairs of id and sourceRefIndex for transacitons which have some reference
  const idRefIdObjArray = randomTransactions
    .filter((t) => t.sourceRefIndex !== undefined)
    .map((t) => ({
      id: sourceIndicesToIdsMap[t.sourceIndex],
      refId: sourceIndicesToIdsMap[t.sourceRefIndex!],
    }));

  const updateResult = await TransactionModel.bulkWrite(
    idRefIdObjArray.map((u) => ({
      updateOne: {
        filter: { _id: u.id },
        update: { $set: { refId: u.refId } },
      },
    })),
    { session },
  );

  if (updateResult.modifiedCount !== idRefIdObjArray.length)
    throw new AppError(
      409,
      'Not all expected transctions were updated with reference id',
      undefined,
      'RANDOM_TRANSACTIONS_REFERENCE_UPDATE_INCOMPLETE',
    );

  // TODO save proper source index counter for this test user because it just goes from 0

  return result.insertedCount;
}
