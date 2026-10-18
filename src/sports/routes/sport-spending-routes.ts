import { FastifyInstance } from 'fastify';

import { authorizeAccessToken } from '@auth/services';
import { validateBody } from '@utils/validation';

import {
  LinkSportSpendingsToTransactionDTO,
  LinkSportSpendingsToTransactionSchema,
  SportSpendingLinkResponseDTO,
  SportSpendingLinkResponseSchema,
  UnlinkSportSpendingFromTransactionDTO,
  UnlinkSportSpendingFromTransactionSchema,
} from '../schema';

import { linkSportSpendingsHandler, unlinkSportSpendingHandler } from './handlers';

export async function sportSpendingRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.post<{
    Body: LinkSportSpendingsToTransactionDTO;
    Reply: SportSpendingLinkResponseDTO;
  }>(
    '/spendings/link',
    {
      preHandler: [
        validateBody(LinkSportSpendingsToTransactionSchema),
        authorizeAccessToken(),
      ],
      schema: {
        tags: ['Sport Spendings'],
        summary: 'Link sport spendings to transaction',
        description: 'Associate one or more sport entries with a financial transaction.',
        body: LinkSportSpendingsToTransactionSchema,
        response: {
          200: SportSpendingLinkResponseSchema,
        },
      },
    },
    linkSportSpendingsHandler,
  );

  app.post<{
    Body: UnlinkSportSpendingFromTransactionDTO;
    Reply: SportSpendingLinkResponseDTO;
  }>(
    '/spendings/unlink',
    {
      preHandler: [
        validateBody(UnlinkSportSpendingFromTransactionSchema),
        authorizeAccessToken(),
      ],
      schema: {
        tags: ['Sport Spendings'],
        summary: 'Unlink sport spending from transaction',
        description: 'Remove transaction association from a sport entry record.',
        body: UnlinkSportSpendingFromTransactionSchema,
        response: {
          200: SportSpendingLinkResponseSchema,
        },
      },
    },
    unlinkSportSpendingHandler,
  );
}
