import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { getEnv } from '@app/config';
import { UserModel } from '@user/model';

dotenv.config();

const run = async () => {

  const { mongoUri } = getEnv();
  const migratedAt = new Date();

  await mongoose.connect(mongoUri);

  try {
    const result = await UserModel.updateMany(
      { emailVerifiedAt: null },
      {
        $set: {
          emailVerifiedAt: migratedAt,
          emailVerificationMethod: 'legacy-backfill',
        },
        $unset: {
          emailVerificationTokenHash: 1,
          emailVerificationExpiresAt: 1,
        },
      },
    );

    console.log(
      [
        'Legacy email verification migration completed.',
        `Matched users: ${result.matchedCount}`,
        `Modified users: ${result.modifiedCount}`,
        `Migration timestamp: ${migratedAt.toISOString()}`,
      ].join('\n'),
    );
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error('Legacy email verification migration failed:', error);
  process.exit(1);
});
