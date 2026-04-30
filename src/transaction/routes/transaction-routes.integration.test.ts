import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from '@app/app';
import { getNamedResourceModel } from '@named-resource';
import { USER_PASSWORD_HASH } from '@testing/factories/user/user-consts';
import {
  clearIntegrationMongo,
  connectIntegrationMongo,
  disconnectIntegrationMongo,
  getIntegrationMongoUri,
  setIntegrationTestEnv,
} from '@testing/integration/mongo';
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

const TEST_ENV = {
  port: 5000,
  nodeEnv: 'test',
  mongoUri: getIntegrationMongoUri(),
  cookieSecret: 'integration-test-cookie-secret',
  jwtAccessSecret: 'integration-test-jwt-secret',
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresDays: 30,
};

describe('transaction app integration', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    setIntegrationTestEnv();
    await connectIntegrationMongo();
    await clearIntegrationMongo();

    app = await buildApp(TEST_ENV);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    await clearIntegrationMongo();
  });

  afterAll(async () => {
    await disconnectIntegrationMongo();
  });

  // prettier-ignore
  it(
    "lists only active transactions owned by the authenticated user - 'GET /api/transactions'",
    async () => {
      const ownerId = new Types.ObjectId();
      const otherUserId = new Types.ObjectId();

      await UserModel.insertMany([
        {
          _id: ownerId,
          firstName: 'Test',
          lastName: 'Owner',
          email: 'owner@example.com',
          passwordHash: USER_PASSWORD_HASH,
        },
        {
          _id: otherUserId,
          firstName: 'Other',
          lastName: 'User',
          email: 'other@example.com',
          passwordHash: USER_PASSWORD_HASH,
        },
      ]);

      const [category, paymentMethod, account] = await Promise.all([
        CategoryModel.findOne({ type: 'system', name: [...SYSTEM_CATEGORY_NAMES][0] }),
        PaymentMethodModel.findOne({
          type: 'system',
          name: [...SYSTEM_PAYMENT_METHOD_NAMES][0],
        }),
        AccountModel.findOne({ type: 'system', name: [...SYSTEM_ACCOUNT_NAMES][0] }),
      ]);

      expect(category).toBeTruthy();
      expect(paymentMethod).toBeTruthy();
      expect(account).toBeTruthy();

      const activeTransactionId = new Types.ObjectId();

      await TransactionModel.insertMany([
        {
          _id: activeTransactionId,
          ownerId,
          date: new Date('2026-02-10T00:00:00.000Z'),
          description: 'Lunch',
          amount: 42.5,
          currency: 'PLN',
          categoryId: category!._id,
          paymentMethodId: paymentMethod!._id,
          accountId: account!._id,
          transactionType: 'expense',
          sourceIndex: 1,
          deletion: null,
        },
        {
          _id: new Types.ObjectId(),
          ownerId,
          date: new Date('2026-02-11T00:00:00.000Z'),
          description: 'Old deleted item',
          amount: 50,
          currency: 'PLN',
          categoryId: category!._id,
          paymentMethodId: paymentMethod!._id,
          accountId: account!._id,
          transactionType: 'expense',
          sourceIndex: 2,
          deletion: {
            deletedAt: new Date('2026-02-12T00:00:00.000Z'),
            purgeAt: new Date('2026-03-14T00:00:00.000Z'),
          },
        },
        {
          _id: new Types.ObjectId(),
          ownerId: otherUserId,
          date: new Date('2026-02-09T00:00:00.000Z'),
          description: 'Other user transaction',
          amount: 99,
          currency: 'PLN',
          categoryId: category!._id,
          paymentMethodId: paymentMethod!._id,
          accountId: account!._id,
          transactionType: 'expense',
          sourceIndex: 3,
          deletion: null,
        },
      ]);

      const token = jwt.sign({ userId: ownerId.toString() }, TEST_ENV.jwtAccessSecret);

      const response = await app.inject({
        method: 'GET',
        url: '/api/transactions',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        items: [
          {
            id: activeTransactionId.toString(),
            ownerId: ownerId.toString(),
            date: '2026-02-10T00:00:00.000Z',
            description: 'Lunch',
            amount: 42.5,
            currency: 'PLN',
            transactionType: 'expense',
            sourceIndex: 1,
            category: {
              id: category!._id.toString(),
              type: 'system',
              name: category!.name,
            },
            paymentMethod: {
              id: paymentMethod!._id.toString(),
              type: 'system',
              name: paymentMethod!.name,
            },
            account: {
              id: account!._id.toString(),
              type: 'system',
              name: account!.name,
            },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ],
      });
    }
  );
});
