import {
  InvestmentOperationListResponseDTO,
  InvestmentOperationListResponseSchema,
  InvestmentOperationResponseDTO,
  InvestmentOperationResponseSchema,
  InvestmentOperationsQuery,
  InvestmentOperationsQuerySchema,
  InvestmentSnapshotOperationDTO,
  InvestmentSnapshotOperationSchema,
} from '@investment/schema';
import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { authorizeAccessToken } from '@auth/services';
import { ParamsJustId, ParamsJustIdSchema } from '@shared/http';
import { validateBody } from '@utils/validation';

import {
  createSnapshotOperationHandler,
  deleteSnapshotOperationHandler,
  getOperationsHandler,
} from './handlers';

const DeleteResponseSchema = z.object({
  id: z.string(),
});

export async function operationsRoutes(app: FastifyInstance) {
  app.post<{
    Body: InvestmentSnapshotOperationDTO;
    Reply: InvestmentOperationResponseDTO;
  }>(
    '/',
    {
      preHandler: [
        validateBody(InvestmentSnapshotOperationSchema),
        authorizeAccessToken(),
      ],
      schema: {
        tags: ['Investments'],
        summary: 'Create snapshot investment operation',
        description:
          'Record a point-in-time balance snapshot for an instrument. ' +
          'Non-snapshot operations (buy, sell, interest, fee) must be created via transactions.',
        body: InvestmentSnapshotOperationSchema,
        response: {
          201: InvestmentOperationResponseSchema,
        },
      },
    },
    createSnapshotOperationHandler,
  );

  app.get<{
    Querystring: InvestmentOperationsQuery;
    Reply: InvestmentOperationListResponseDTO;
  }>(
    '/',
    {
      preHandler: [authorizeAccessToken()],
      schema: {
        tags: ['Investments'],
        summary: 'List investment operations',
        description:
          'Return investment operations filtered by instrument, kind, or date.',
        querystring: InvestmentOperationsQuerySchema,
        response: {
          200: InvestmentOperationListResponseSchema,
        },
      },
    },
    getOperationsHandler,
  );

  app.delete<{
    Params: ParamsJustId;
    Reply: { id: string };
  }>(
    '/:id',
    {
      preHandler: [authorizeAccessToken()],
      schema: {
        tags: ['Investments'],
        summary: 'Delete snapshot investment operation',
        description:
          'Delete a snapshot investment operation. ' +
          'Cash-flow operations linked to transactions cannot be deleted here.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteResponseSchema,
        },
      },
    },
    deleteSnapshotOperationHandler,
  );
}
