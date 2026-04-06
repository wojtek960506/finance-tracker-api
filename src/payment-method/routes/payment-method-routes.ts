import { FastifyInstance } from 'fastify';
import { DeleteResult } from 'mongoose';

import { authorizeAccessToken } from '@auth/services';
import {
  NamedResourceDTO,
  NamedResourceResponseDTO,
  NamedResourceResponseSchema,
  NamedResourceSchema,
  NamedResourcesResponseDTO,
  NamedResourcesResponseSchema,
} from '@named-resource';
import {
  createNamedResourceHandler,
  deleteNamedResourceHandler,
  favoriteNamedResourceHandler,
  getFavoriteNamedResourcesHandler,
  getNamedResourceHandler,
  getNamedResourcesHandler,
  unfavoriteNamedResourceHandler,
  updateNamedResourceHandler,
} from '@named-resource/routes/handlers';
import { DeleteResultSchema, ParamsJustId, ParamsJustIdSchema } from '@shared/http';
import { validateBody } from '@utils/validation';

export async function paymentMethodRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{ Reply: NamedResourcesResponseDTO }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Payment Methods'],
        summary: 'List payment methods',
        description: 'Return all payment methods for the authenticated user.',
        response: {
          200: NamedResourcesResponseSchema,
        },
      },
    },
    getNamedResourcesHandler('paymentMethod'),
  );

  app.get<{ Reply: NamedResourcesResponseDTO }>(
    '/favorites',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Payment Methods'],
        summary: 'List favorite payment methods',
        description: 'Return all favorite payment methods for the authenticated user.',
        response: {
          200: NamedResourcesResponseSchema,
        },
      },
    },
    getFavoriteNamedResourcesHandler('paymentMethod'),
  );

  app.get<{ Params: ParamsJustId; Reply: NamedResourceResponseDTO }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Payment Methods'],
        summary: 'Get payment method by id',
        description: 'Return a single payment method by id.',
        params: ParamsJustIdSchema,
        response: {
          200: NamedResourceResponseSchema,
        },
      },
    },
    getNamedResourceHandler('paymentMethod'),
  );

  app.post<{ Body: NamedResourceDTO; Reply: NamedResourceResponseDTO }>(
    '/',
    {
      preHandler: [validateBody(NamedResourceSchema), authorizeAccessToken()],
      schema: {
        tags: ['Payment Methods'],
        summary: 'Create payment method',
        description: 'Create a new payment method for the authenticated user.',
        body: NamedResourceSchema,
        response: {
          201: NamedResourceResponseSchema,
        },
      },
    },
    createNamedResourceHandler('paymentMethod'),
  );

  app.put<{
    Params: ParamsJustId;
    Body: NamedResourceDTO;
    Reply: NamedResourceResponseDTO;
  }>(
    '/:id',
    {
      preHandler: [validateBody(NamedResourceSchema), authorizeAccessToken()],
      schema: {
        tags: ['Payment Methods'],
        summary: 'Update payment method',
        description: 'Update a payment method by id.',
        params: ParamsJustIdSchema,
        body: NamedResourceSchema,
        response: {
          200: NamedResourceResponseSchema,
        },
      },
    },
    updateNamedResourceHandler('paymentMethod'),
  );

  app.post<{ Params: ParamsJustId; Reply: NamedResourceResponseDTO }>(
    '/:id/favorite',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Payment Methods'],
        summary: 'Favorite payment method',
        description: 'Mark payment method as favorite for the authenticated user.',
        params: ParamsJustIdSchema,
        response: {
          200: NamedResourceResponseSchema,
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
