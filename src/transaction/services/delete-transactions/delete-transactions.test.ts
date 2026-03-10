import { USER_ID_STR } from '@testing/factories/general';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TransactionModel } from '@transaction/model';
import { UserModel } from '@user/model';
import { AppError } from '@utils/errors';

import { deleteTransactions } from './delete-transactions';

describe('deleteTransactions', () => {
  const deleteResult = { deletedCount: 100 };
  const testUserEmail = 'test1@test.com';

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('delete transactions for test user', async () => {
    vi.spyOn(UserModel, 'findById').mockResolvedValue({ email: testUserEmail });
    vi.spyOn(TransactionModel, 'deleteMany').mockResolvedValue(deleteResult as any);

    const result = await deleteTransactions(USER_ID_STR);
    expect(UserModel.findById).toHaveBeenCalledOnce();
    expect(UserModel.findById).toHaveBeenCalledWith(USER_ID_STR);
    expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledWith({ ownerId: USER_ID_STR });
    expect(result).toEqual(deleteResult);
  });

  it('throws error when user other then testing one', async () => {
    vi.spyOn(UserModel, 'findById').mockResolvedValue({ email: 'someemail' });
    vi.spyOn(TransactionModel, 'deleteMany');

    await expect(deleteTransactions(USER_ID_STR)).rejects.toThrow(AppError);
    expect(UserModel.findById).toHaveBeenCalledOnce();
    expect(UserModel.findById).toHaveBeenCalledWith(USER_ID_STR);
    expect(TransactionModel.deleteMany).not.toHaveBeenCalledOnce();
  });
});
