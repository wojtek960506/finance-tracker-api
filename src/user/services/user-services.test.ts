import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

// mock BEFORE importing files that use argon2 / external modules
vi.mock('argon2', () => ({ default: { hash: vi.fn() } }));
vi.mock('@auth/services', () => ({
  createEmailVerificationToken: vi.fn(),
  sendEmailVerification: vi.fn(),
}));

const sessionMock = {} as any;

vi.mock('@utils/with-session', () => ({
  withSession: vi
    .fn()
    .mockImplementation(async (func, ...args) => await func(sessionMock, ...args)),
}));
vi.mock('@user/services', () => ({ createUser: vi.fn() }));
vi.mock('@transaction/services', () => ({ createRandomTransactions: vi.fn() }));

import argon2 from 'argon2';

import { createEmailVerificationToken, sendEmailVerification } from '@auth/services';
import { getNamedResourceModel } from '@named-resource';
import { USER_ID_STR } from '@testing/factories/general';
import {
  getUserDTO,
  getUserResultJSON,
  getUserResultSerialized,
  USER_PASSWORD_HASH,
} from '@testing/factories/user';
import { TransactionModel } from '@transaction/model';
import { createRandomTransactions } from '@transaction/services';
import * as db from '@user/db';
import { UserModel } from '@user/model';
import * as serializers from '@user/serializers';
import { createUser as mockedCreateUser } from '@user/services';
import { AppError } from '@utils/errors';
import {
  UserNotAuthorizedToDeleteError,
  UserNotDeletedError,
  UserNotFoundError,
} from '@utils/errors/user-errors';
import { randomObjectIdString } from '@utils/random';
import { withSession } from '@utils/with-session';

import { createTestUser } from './create-test-user/create-test-user';
import { createUser } from './create-user/create-user';
import { deleteUser } from './delete-user/delete-user';
import { getUser } from './get-user/get-user';
import { getUsers } from './get-users/get-users';

describe('user-services', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    const user = getUserResultJSON();
    const userSerialized = getUserResultSerialized();
    const { password, ...restOfUserDTO } = getUserDTO();

    it('creates user', async () => {
      const tokenExpiresAt = new Date('2026-05-05T10:00:00.000Z');
      (argon2.hash as any).mockResolvedValue(USER_PASSWORD_HASH);
      (createEmailVerificationToken as any).mockReturnValue({
        token: 'verification-token',
        tokenHash: 'verification-token-hash',
        expiresAt: tokenExpiresAt,
      });
      (sendEmailVerification as any).mockResolvedValue(undefined);
      vi.spyOn(UserModel, 'create').mockResolvedValue([user] as any);
      vi.spyOn(serializers, 'serializeUser').mockReturnValue(userSerialized as any);

      const result = await createUser({ ...restOfUserDTO, password }, sessionMock);

      expect(argon2.hash).toHaveBeenCalledOnce();
      expect(argon2.hash).toHaveBeenCalledWith(password);
      expect(UserModel.create).toHaveBeenCalledOnce();
      expect(UserModel.create).toHaveBeenCalledWith(
        [
          {
            ...restOfUserDTO,
            passwordHash: USER_PASSWORD_HASH,
            emailVerifiedAt: null,
            emailVerificationMethod: null,
            emailVerificationTokenHash: 'verification-token-hash',
            emailVerificationExpiresAt: tokenExpiresAt,
          },
        ],
        { session: sessionMock },
      );
      expect(sendEmailVerification).toHaveBeenCalledOnce();
      expect(sendEmailVerification).toHaveBeenCalledWith({
        email: user.email,
        token: 'verification-token',
      });
      expect(serializers.serializeUser).toHaveBeenCalledOnce();
      expect(serializers.serializeUser).toHaveBeenCalledWith(user);
      expect(result).toEqual(userSerialized);
    });

    it('throws error when user with given email exists', async () => {
      const EMAIL_ALREADY_EXISTS_CODE = 11000;
      (createEmailVerificationToken as any).mockReturnValue({
        token: 'verification-token',
        tokenHash: 'verification-token-hash',
        expiresAt: new Date('2026-05-05T10:00:00.000Z'),
      });
      vi.spyOn(UserModel, 'create').mockRejectedValue({
        code: EMAIL_ALREADY_EXISTS_CODE,
      });
      vi.spyOn(serializers, 'serializeUser');

      await expect(createUser({ ...restOfUserDTO, password })).rejects.toThrow(Error);
      expect(UserModel.create).toHaveBeenCalledOnce();
      expect(sendEmailVerification).not.toHaveBeenCalled();
      expect(serializers.serializeUser).not.toHaveBeenCalled();
    });

    it('throws some not specific error', async () => {
      (createEmailVerificationToken as any).mockReturnValue({
        token: 'verification-token',
        tokenHash: 'verification-token-hash',
        expiresAt: new Date('2026-05-05T10:00:00.000Z'),
      });
      vi.spyOn(UserModel, 'create').mockResolvedValue({} as any);
      vi.spyOn(serializers, 'serializeUser').mockImplementation(() => {
        throw new Error();
      });

      await expect(createUser({ ...restOfUserDTO, password })).rejects.toThrow(AppError);
      expect(UserModel.create).toHaveBeenCalledOnce();
      expect(sendEmailVerification).not.toHaveBeenCalled();
      expect(serializers.serializeUser).not.toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('get not authenticated user', async () => {
      vi.spyOn(db, 'findUser');
      vi.spyOn(serializers, 'serializeUser');
      await expect(getUser(USER_ID_STR, '123')).rejects.toThrow(AppError);
      expect(db.findUser).not.toHaveBeenCalled();
      expect(serializers.serializeUser).not.toHaveBeenCalled();
    });

    it('get authenticated user', async () => {
      const userJSON = getUserResultJSON();
      const userSerialized = getUserResultSerialized();

      vi.spyOn(db, 'findUser').mockResolvedValue(userJSON as any);
      vi.spyOn(serializers, 'serializeUser').mockResolvedValue(userSerialized as any);

      const result = await getUser(USER_ID_STR, USER_ID_STR);

      expect(db.findUser).toHaveBeenCalledOnce();
      expect(db.findUser).toHaveBeenCalledWith(USER_ID_STR);
      expect(serializers.serializeUser).toHaveBeenCalledOnce();
      expect(serializers.serializeUser).toHaveBeenCalledWith(userJSON);
      expect(result).toEqual(userSerialized);
    });
  });

  describe('getUsers', () => {
    const user = getUserResultJSON();
    const userSerialized = getUserResultSerialized();

    const sortMock = vi.fn();
    const query = { sort: sortMock };

    it('get users', async () => {
      sortMock.mockResolvedValue([user]);
      vi.spyOn(UserModel, 'find').mockReturnValue(query as any);
      vi.spyOn(serializers, 'serializeUser').mockReturnValueOnce(userSerialized as any);

      const result = await getUsers();

      expect(UserModel.find).toHaveBeenCalledOnce();
      expect(sortMock).toHaveBeenCalledOnce();
      expect(result).toEqual([userSerialized]);
    });
  });

  describe('deleteUser', () => {
    const CategoryModel = getNamedResourceModel('category');
    const AccountModel = getNamedResourceModel('account');
    const PaymentMethodModel = getNamedResourceModel('paymentMethod');
    const user = getUserResultJSON();
    const userSerialized = getUserResultSerialized();
    const anotherUserId = randomObjectIdString();

    it('deletes authenticated user', async () => {
      vi.spyOn(UserModel, 'findById')
        .mockResolvedValueOnce(user as any)
        .mockResolvedValueOnce(user as any);
      vi.spyOn(TransactionModel, 'deleteMany').mockResolvedValue({
        deletedCount: 3,
      } as any);
      vi.spyOn(CategoryModel, 'deleteMany').mockResolvedValue({ deletedCount: 2 } as any);
      vi.spyOn(AccountModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 } as any);
      vi.spyOn(PaymentMethodModel, 'deleteMany').mockResolvedValue({
        deletedCount: 1,
      } as any);
      vi.spyOn(UserModel, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as any);
      vi.spyOn(serializers, 'serializeUser').mockReturnValue(userSerialized as any);
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await deleteUser(USER_ID_STR, USER_ID_STR);

      expect(UserModel.findById).toHaveBeenCalledTimes(2);
      expect(UserModel.findById).toHaveBeenNthCalledWith(1, USER_ID_STR);
      expect(UserModel.findById).toHaveBeenNthCalledWith(2, USER_ID_STR);
      expect(withSession).toHaveBeenCalledOnce();
      expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
      expect(TransactionModel.deleteMany).toHaveBeenCalledWith(
        { ownerId: USER_ID_STR },
        { session: sessionMock },
      );
      expect(CategoryModel.deleteMany).toHaveBeenCalledOnce();
      expect(CategoryModel.deleteMany).toHaveBeenCalledWith(
        { ownerId: USER_ID_STR },
        { session: sessionMock },
      );
      expect(PaymentMethodModel.deleteMany).toHaveBeenCalledOnce();
      expect(PaymentMethodModel.deleteMany).toHaveBeenCalledWith(
        { ownerId: USER_ID_STR },
        { session: sessionMock },
      );
      expect(AccountModel.deleteMany).toHaveBeenCalledOnce();
      expect(AccountModel.deleteMany).toHaveBeenCalledWith(
        { ownerId: USER_ID_STR },
        { session: sessionMock },
      );
      expect(UserModel.deleteOne).toHaveBeenCalledOnce();
      expect(UserModel.deleteOne).toHaveBeenCalledWith(
        { _id: USER_ID_STR },
        { session: sessionMock },
      );
      expect(serializers.serializeUser).toHaveBeenCalledOnce();
      expect(serializers.serializeUser).toHaveBeenCalledWith(user);
      expect(consoleLogSpy).toHaveBeenCalledTimes(7);
      expect(result).toEqual(userSerialized);
    });

    it('throws when authenticated user does not exist', async () => {
      vi.spyOn(UserModel, 'findById').mockResolvedValue(null);

      await expect(deleteUser(USER_ID_STR, USER_ID_STR)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(withSession).not.toHaveBeenCalled();
    });

    it('throws when user is not authorized to delete another user', async () => {
      vi.spyOn(UserModel, 'findById').mockResolvedValue(user as any);

      await expect(deleteUser(anotherUserId, USER_ID_STR)).rejects.toThrow(
        UserNotAuthorizedToDeleteError,
      );

      expect(withSession).not.toHaveBeenCalled();
    });

    it('allows special test user to delete another user', async () => {
      const specialUser = { ...user, email: 'test1@test.com' };

      vi.spyOn(UserModel, 'findById')
        .mockResolvedValueOnce(specialUser as any)
        .mockResolvedValueOnce(user as any);
      vi.spyOn(TransactionModel, 'deleteMany').mockResolvedValue({
        deletedCount: 10,
      } as any);
      vi.spyOn(CategoryModel, 'deleteMany').mockResolvedValue({ deletedCount: 4 } as any);
      vi.spyOn(PaymentMethodModel, 'deleteMany').mockResolvedValue({
        deletedCount: 3,
      } as any);
      vi.spyOn(AccountModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 } as any);
      vi.spyOn(UserModel, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as any);
      vi.spyOn(serializers, 'serializeUser').mockReturnValue(userSerialized as any);

      const result = await deleteUser(anotherUserId, USER_ID_STR);

      expect(withSession).toHaveBeenCalledOnce();
      expect(UserModel.findById).toHaveBeenNthCalledWith(1, USER_ID_STR);
      expect(UserModel.findById).toHaveBeenNthCalledWith(2, anotherUserId);
      expect(result).toEqual(userSerialized);
    });

    it('throws when user to delete does not exist', async () => {
      vi.spyOn(UserModel, 'findById')
        .mockResolvedValueOnce(user as any)
        .mockResolvedValueOnce(null);
      vi.spyOn(TransactionModel, 'deleteMany');
      vi.spyOn(CategoryModel, 'deleteMany');
      vi.spyOn(PaymentMethodModel, 'deleteMany');
      vi.spyOn(AccountModel, 'deleteMany');
      vi.spyOn(UserModel, 'deleteOne');
      vi.spyOn(serializers, 'serializeUser');

      await expect(deleteUser(USER_ID_STR, USER_ID_STR)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(TransactionModel.deleteMany).not.toHaveBeenCalled();
      expect(CategoryModel.deleteMany).not.toHaveBeenCalled();
      expect(PaymentMethodModel.deleteMany).not.toHaveBeenCalled();
      expect(PaymentMethodModel.deleteMany).not.toHaveBeenCalled();
      expect(AccountModel.deleteMany).not.toHaveBeenCalled();
      expect(serializers.serializeUser).not.toHaveBeenCalled();
    });

    it('throws when user was not deleted', async () => {
      vi.spyOn(UserModel, 'findById')
        .mockResolvedValueOnce(user as any)
        .mockResolvedValueOnce(user as any);
      vi.spyOn(TransactionModel, 'deleteMany').mockResolvedValue({
        deletedCount: 10,
      } as any);
      vi.spyOn(CategoryModel, 'deleteMany').mockResolvedValue({ deletedCount: 4 } as any);
      vi.spyOn(PaymentMethodModel, 'deleteMany').mockResolvedValue({
        deletedCount: 3,
      } as any);
      vi.spyOn(AccountModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 } as any);
      vi.spyOn(UserModel, 'deleteOne').mockResolvedValue({ deletedCount: 0 } as any);
      vi.spyOn(serializers, 'serializeUser');

      await expect(deleteUser(USER_ID_STR, USER_ID_STR)).rejects.toThrow(
        UserNotDeletedError,
      );

      expect(serializers.serializeUser).not.toHaveBeenCalled();
    });
  });

  describe('createTestUser', () => {
    const USERNAME = 'testUser';
    const TOTAL_TRANSACTIONS = 1000;
    const DEFAULT_TRANSACTIONS = 200;
    const EMAIL = `${USERNAME}@test.com`;
    const NEW_BODY = {
      firstName: USERNAME,
      lastName: USERNAME,
      email: EMAIL,
      password: '123',
    };
    const dto = { username: USERNAME, totalTransactions: TOTAL_TRANSACTIONS };
    const dtoWithoutTotalTransactions = { username: USERNAME };
    const testUser = { id: USER_ID_STR, email: EMAIL };

    it('create test user with specified total transactions', async () => {
      (mockedCreateUser as Mock).mockResolvedValue(testUser);
      (createRandomTransactions as Mock).mockResolvedValue(TOTAL_TRANSACTIONS);

      const result = await createTestUser(dto);

      expect(mockedCreateUser).toHaveBeenCalledOnce();
      expect(mockedCreateUser).toHaveBeenCalledWith(NEW_BODY, sessionMock);
      expect(createRandomTransactions).toHaveBeenCalledOnce();
      expect(createRandomTransactions).toHaveBeenCalledWith(
        USER_ID_STR,
        TOTAL_TRANSACTIONS,
        sessionMock,
      );
      expect(result).toEqual({
        userId: USER_ID_STR,
        email: EMAIL,
        insertedTransactionsCount: TOTAL_TRANSACTIONS,
      });
    });

    it('create test user with default number of total transactions', async () => {
      (mockedCreateUser as Mock).mockResolvedValue(testUser);
      (createRandomTransactions as Mock).mockResolvedValue(DEFAULT_TRANSACTIONS);

      const result = await createTestUser(dtoWithoutTotalTransactions);

      expect(mockedCreateUser).toHaveBeenCalledOnce();
      expect(mockedCreateUser).toHaveBeenCalledWith(NEW_BODY, sessionMock);
      expect(createRandomTransactions).toHaveBeenCalledOnce();
      expect(createRandomTransactions).toHaveBeenCalledWith(
        USER_ID_STR,
        DEFAULT_TRANSACTIONS,
        sessionMock,
      );
      expect(result).toEqual({
        userId: USER_ID_STR,
        email: EMAIL,
        insertedTransactionsCount: DEFAULT_TRANSACTIONS,
      });
    });
  });
});
