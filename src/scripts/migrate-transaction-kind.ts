import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { getEnv } from '@app/config';
import { getNamedResourceModel } from '@named-resource';
import { TransactionModel } from '@transaction/model';

dotenv.config();

export const runTransactionKindMigration = async () => {
  const CategoryModel = getNamedResourceModel('category');

  const exchangeCategory = await CategoryModel.findOne({
    type: 'system',
    name: 'exchange',
  });
  const myAccountCategory = await CategoryModel.findOne({
    type: 'system',
    name: 'myAccount',
  });
  const investmentCategory = await CategoryModel.findOne({
    type: 'system',
    name: 'investment',
  });

  const exchangeCatId = exchangeCategory?._id;
  const myAccountCatId = myAccountCategory?._id;
  const investmentCatId = investmentCategory?._id;

  // 1. Update exchange transactions
  const exchangeRes = exchangeCatId
    ? await TransactionModel.updateMany(
        { categoryId: exchangeCatId },
        { $set: { kind: 'exchange' } },
      )
    : { modifiedCount: 0 };

  // 2. Update transfer transactions
  const transferRes = myAccountCatId
    ? await TransactionModel.updateMany(
        { categoryId: myAccountCatId },
        { $set: { kind: 'transfer' } },
      )
    : { modifiedCount: 0 };

  // 3. Update investment transactions
  const investmentRes = investmentCatId
    ? await TransactionModel.updateMany(
        { categoryId: investmentCatId },
        { $set: { kind: 'investment' } },
      )
    : { modifiedCount: 0 };

  // 4. Update standard transactions (all remaining)
  const systemCategoryIds = [exchangeCatId, myAccountCatId, investmentCatId].filter(
    Boolean,
  );

  const standardRes = await TransactionModel.updateMany(
    {
      categoryId: { $nin: systemCategoryIds },
      $or: [{ kind: { $exists: false } }, { kind: 'standard' }],
    },
    { $set: { kind: 'standard' } },
  );

  return {
    exchangeCount: exchangeRes.modifiedCount,
    transferCount: transferRes.modifiedCount,
    investmentCount: investmentRes.modifiedCount,
    standardCount: standardRes.modifiedCount,
  };
};

const run = async () => {
  const { mongoUri } = getEnv();
  await mongoose.connect(mongoUri);

  try {
    const counts = await runTransactionKindMigration();
    console.log(
      [
        'Transaction kind migration completed successfully:',
        `  Exchange:   ${counts.exchangeCount}`,
        `  Transfer:   ${counts.transferCount}`,
        `  Investment: ${counts.investmentCount}`,
        `  Standard:   ${counts.standardCount}`,
      ].join('\n'),
    );
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1]?.endsWith('migrate-transaction-kind.ts')) {
  run().catch((error) => {
    console.error('Transaction kind migration failed:', error);
    process.exit(1);
  });
}
