import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { createIntegrationAccessToken } from '../auth';
import { getSystemNamedResources } from '../fixtures/named-resources';
import {
  buildStandardTransactionDoc,
  insertTransactions,
} from '../fixtures/transactions';
import { createIntegrationUser } from '../fixtures/users';
import { setupIntegrationSuite } from '../suite';

describe('transaction app integration', () => {
  const { getApp } = setupIntegrationSuite();

  // prettier-ignore
  it(
    "lists only active transactions owned by the authenticated user - 'GET /api/transactions'",
    async () => {
      const ownerId = await createIntegrationUser({
        firstName: 'Test',
        lastName: 'Owner',
        email: 'owner@example.com',
      });
      const otherUserId = await createIntegrationUser({
        firstName: 'Other',
        lastName: 'User',
        email: 'other@example.com',
      });

      const { category, paymentMethod, account } = await getSystemNamedResources();
      const activeTransactionId = new Types.ObjectId();

      await insertTransactions([
        buildStandardTransactionDoc({
          _id: activeTransactionId,
          ownerId,
          categoryId: category._id,
          paymentMethodId: paymentMethod._id,
          accountId: account._id,
        }),
        buildStandardTransactionDoc({
          ownerId,
          categoryId: category._id,
          paymentMethodId: paymentMethod._id,
          accountId: account._id,
          description: 'Old deleted item',
          amount: 50,
          date: new Date('2026-02-11T00:00:00.000Z'),
          sourceIndex: 2,
          deletion: {
            deletedAt: new Date('2026-02-12T00:00:00.000Z'),
            purgeAt: new Date('2026-03-14T00:00:00.000Z'),
          },
        }),
        buildStandardTransactionDoc({
          ownerId: otherUserId,
          categoryId: category._id,
          paymentMethodId: paymentMethod._id,
          accountId: account._id,
          description: 'Other user transaction',
          amount: 99,
          date: new Date('2026-02-09T00:00:00.000Z'),
          sourceIndex: 3,
        }),
      ]);

      const response = await getApp().inject({
        method: 'GET',
        url: '/api/transactions',
        headers: {
          authorization: `Bearer ${createIntegrationAccessToken(ownerId.toString())}`,
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
              type: 'system',
              name: category.name,
            },
            paymentMethod: {
              id: paymentMethod._id.toString(),
              type: 'system',
              name: paymentMethod.name,
            },
            account: {
              id: account._id.toString(),
              type: 'system',
              name: account.name,
            },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ],
      });
    }
  );
});
