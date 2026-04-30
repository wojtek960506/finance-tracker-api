import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import { getNamedResourceModel } from '@named-resource';
import { USER_PASSWORD_HASH } from '@testing/factories/user/user-consts';
import {
  clearIntegrationMongo,
  connectIntegrationMongo,
  disconnectIntegrationMongo,
} from '@testing/integration/mongo';
import { TransactionModel } from '@transaction/model';
import { UserModel } from '@user/model/user-model';

import { transactionRoutes } from './transaction-routes';

const CategoryModel = getNamedResourceModel('category');
const PaymentMethodModel = getNamedResourceModel('paymentMethod');
const AccountModel = getNamedResourceModel('account');

describe('transaction routes integration', () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();

  beforeAll(async () => {
    await connectIntegrationMongo();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    app.register(transactionRoutes);
    await registerErrorHandler(app);
    await app.ready();
  });

  afterEach(async () => {
    await clearIntegrationMongo();
  });

  afterAll(async () => {
    await app.close();
    await disconnectIntegrationMongo();
  });

  it("lists only active transactions owned by the authenticated user - 'GET /'", async () => {
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
      CategoryModel.create({
        ownerId,
        type: 'user',
        name: 'Food',
        nameNormalized: 'food',
      }),
      PaymentMethodModel.create({
        ownerId,
        type: 'user',
        name: 'Debit Card',
        nameNormalized: 'debit card',
      }),
      AccountModel.create({
        ownerId,
        type: 'user',
        name: 'Main Wallet',
        nameNormalized: 'main wallet',
      }),
    ]);

    const activeTransactionId = new Types.ObjectId();

    await TransactionModel.insertMany([
      {
        _id: activeTransactionId,
        ownerId,
        date: new Date('2026-02-10T00:00:00.000Z'),
        description: 'Lunch',
        amount: 42.5,
        currency: 'PLN',
        categoryId: category._id,
        paymentMethodId: paymentMethod._id,
        accountId: account._id,
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
        categoryId: category._id,
        paymentMethodId: paymentMethod._id,
        accountId: account._id,
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
        categoryId: category._id,
        paymentMethodId: paymentMethod._id,
        accountId: account._id,
        transactionType: 'expense',
        sourceIndex: 3,
        deletion: null,
      },
    ]);

    const token = jwt.sign(
      { userId: ownerId.toString() },
      process.env.JWT_ACCESS_SECRET as string,
    );

    const response = await app.inject({
      method: 'GET',
      url: '/',
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
            id: category._id.toString(),
            type: 'user',
            name: 'Food',
          },
          paymentMethod: {
            id: paymentMethod._id.toString(),
            type: 'user',
            name: 'Debit Card',
          },
          account: {
            id: account._id.toString(),
            type: 'user',
            name: 'Main Wallet',
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ],
    });
  });
});
