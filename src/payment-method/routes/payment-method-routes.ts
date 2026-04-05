import { FastifyInstance } from 'fastify';
import { DeleteResult } from 'mongoose';

import { authorizeAccessToken } from '@auth/services';
import {
  PaymentMethodDTO,
  PaymentMethodResponseDTO,
  PaymentMethodResponseSchema,
  PaymentMethodSchema,
  PaymentMethodsResponseDTO,
  PaymentMethodsResponseSchema,
} from '@payment-method/schema';
import { DeleteResultSchema, ParamsJustId, ParamsJustIdSchema } from '@shared/http';
import {
  createNamedResourceHandler,
  deleteNamedResourceHandler,
  favoriteNamedResourceHandler,
  getFavoriteNamedResourcesHandler,
  getNamedResourceHandler,
  getNamedResourcesHandler,
  unfavoriteNamedResourceHandler,
  updateNamedResourceHandler,
} from '@shared/named-resource/routes/handlers';
import { validateBody } from '@utils/validation';

export async function paymentMethodRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{ Reply: PaymentMethodsResponseDTO }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Payment Methods'],
        summary: 'List payment methods',
        description: 'Return all payment methods for the authenticated user.',
        response: {
          200: PaymentMethodsResponseSchema,
        },
      },
    },
    getNamedResourcesHandler('paymentMethod'),
  );

  app.get<{ Reply: PaymentMethodsResponseDTO }>(
    '/favorites',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Payment Methods'],
        summary: 'List favorite payment methods',
        description: 'Return all favorite payment methods for the authenticated user.',
        response: {
          200: PaymentMethodsResponseSchema,
        },
      },
    },
    getFavoriteNamedResourcesHandler('paymentMethod'),
  );

  app.get<{ Params: ParamsJustId; Reply: PaymentMethodResponseDTO }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Payment Methods'],
        summary: 'Get payment method by id',
        description: 'Return a single payment method by id.',
        params: ParamsJustIdSchema,
        response: {
          200: PaymentMethodResponseSchema,
        },
      },
    },
    getNamedResourceHandler('paymentMethod'),
  );

  app.post<{ Body: PaymentMethodDTO; Reply: PaymentMethodResponseDTO }>(
    '/',
    {
      preHandler: [validateBody(PaymentMethodSchema), authorizeAccessToken()],
      schema: {
        tags: ['Payment Methods'],
        summary: 'Create payment method',
        description: 'Create a new payment method for the authenticated user.',
        body: PaymentMethodSchema,
        response: {
          201: PaymentMethodResponseSchema,
        },
      },
    },
    createNamedResourceHandler('paymentMethod'),
  );

  app.put<{
    Params: ParamsJustId;
    Body: PaymentMethodDTO;
    Reply: PaymentMethodResponseDTO;
  }>(
    '/:id',
    {
      preHandler: [validateBody(PaymentMethodSchema), authorizeAccessToken()],
      schema: {
        tags: ['Payment Methods'],
        summary: 'Update payment method',
        description: 'Update a payment method by id.',
        params: ParamsJustIdSchema,
        body: PaymentMethodSchema,
        response: {
          200: PaymentMethodResponseSchema,
        },
      },
    },
    updateNamedResourceHandler('paymentMethod'),
  );

  app.post<{ Params: ParamsJustId; Reply: PaymentMethodResponseDTO }>(
    '/:id/favorite',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Payment Methods'],
        summary: 'Favorite payment method',
        description: 'Mark payment method as favorite for the authenticated user.',
        params: ParamsJustIdSchema,
        response: {
          200: PaymentMethodResponseSchema,
        },
      },
    },
    favoriteNamedResourceHandler('paymentMethod'),
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteResult }>(
    '/:id/favorite',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Payment Methods'],
        summary: 'Unfavorite payment method',
        description: 'Remove payment method from favorites for the authenticated user.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteResultSchema,
        },
      },
    },
    unfavoriteNamedResourceHandler('paymentMethod'),
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteResult }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Payment Methods'],
        summary: 'Delete payment method',
        description: 'Delete a payment method by id.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteResultSchema,
        },
      },
    },
    deleteNamedResourceHandler('paymentMethod'),
  );
}
