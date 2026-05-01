import { Types } from 'mongoose';

import { USER_PASSWORD_HASH } from '@testing/factories/user/user-consts';
import { UserModel } from '@user/model/user-model';

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
