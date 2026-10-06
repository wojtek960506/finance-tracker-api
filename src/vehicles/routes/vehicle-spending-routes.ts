import {
  LinkSpendingsToTransactionDTO,
  LinkSpendingsToTransactionSchema,
  SpendingLinkResponseDTO,
  SpendingLinkResponseSchema,
  UnlinkSpendingFromTransactionDTO,
  UnlinkSpendingFromTransactionSchema,
} from '@vehicles/schema';
import { FastifyInstance } from 'fastify';

import { authorizeAccessToken } from '@auth/services';
import { validateBody } from '@utils/validation';

import { linkSpendingsHandler, unlinkSpendingHandler } from './handlers';

export async function vehicleSpendingRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.post<{
    Body: LinkSpendingsToTransactionDTO;
    Reply: SpendingLinkResponseDTO;
  }>(
    '/spendings/link',
    {
      preHandler: [
        validateBody(LinkSpendingsToTransactionSchema),
        authorizeAccessToken(),
      ],
      schema: {
        tags: ['Vehicles Spendings'],
        summary: 'Link vehicle spendings to transaction',
        description:
          'Associate fuel, equipment, or maintenance spendings ' +
          'with a financial transaction.',
        body: LinkSpendingsToTransactionSchema,
        response: {
          200: SpendingLinkResponseSchema,
        },
      },
    },
    linkSpendingsHandler,
  );

  app.post<{
    Body: UnlinkSpendingFromTransactionDTO;
    Reply: SpendingLinkResponseDTO;
  }>(
    '/spendings/unlink',
    {
      preHandler: [
        validateBody(UnlinkSpendingFromTransactionSchema),
        authorizeAccessToken(),
      ],
      schema: {
        tags: ['Vehicles Spendings'],
        summary: 'Unlink vehicle spending from transaction',
        description:
          'Remove transaction association from a fuel, equipment, ' +
          'or maintenance spending record.',
        body: UnlinkSpendingFromTransactionSchema,
        response: {
          200: SpendingLinkResponseSchema,
        },
      },
    },
    unlinkSpendingHandler,
  );
}
