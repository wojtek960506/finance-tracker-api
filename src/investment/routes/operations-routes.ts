import {
  InvestmentOperationCreateDTO,
  InvestmentOperationCreateSchema,
  InvestmentOperationListResponseDTO,
  InvestmentOperationListResponseSchema,
  InvestmentOperationResponseDTO,
  InvestmentOperationResponseSchema,
  InvestmentOperationsQuery,
  InvestmentOperationsQuerySchema,
  InvestmentOperationUpdateDTO,
  InvestmentOperationUpdateSchema,
} from '@investment/schema';
import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { authorizeAccessToken } from '@auth/services';
import { ParamsJustId, ParamsJustIdSchema } from '@shared/http';
import { validateBody } from '@utils/validation';

import {
  createOperationHandler,
  deleteOperationHandler,
  getOperationsHandler,
  updateOperationHandler,
} from './handlers';

const DeleteResponseSchema = z.object({
  id: z.string(),
});

export async function operationsRoutes(app: FastifyInstance) {
  app.post<{
    Body: InvestmentOperationCreateDTO;
    Reply: InvestmentOperationResponseDTO;
  }>(
    '/',
    {
      preHandler: [validateBody(InvestmentOperationCreateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Investments'],
        summary: 'Create investment operation',
        description:
          'Record a standalone investment operation (snapshot for shares/funds, ' +
          'interest/fee for termDeposit/savings). Non-standalone operations (buy, sell) ' +
          'must be created via transactions.',
        body: InvestmentOperationCreateSchema,
        response: {
          201: InvestmentOperationResponseSchema,
        },
      },
    },
    createOperationHandler,
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

  const updateRouteConfig = {
    preHandler: [validateBody(InvestmentOperationUpdateSchema), authorizeAccessToken()],
    schema: {
      tags: ['Investments'],
      summary: 'Update investment operation',
      description:
        'Update a standalone investment operation. ' +
        'Operations linked to transactions cannot be edited here.',
      params: ParamsJustIdSchema,
      body: InvestmentOperationUpdateSchema,
      response: {
        200: InvestmentOperationResponseSchema,
      },
    },
  };

  app.patch<{
    Params: ParamsJustId;
    Body: InvestmentOperationUpdateDTO;
    Reply: InvestmentOperationResponseDTO;
  }>('/:id', updateRouteConfig, updateOperationHandler);

  app.delete<{
    Params: ParamsJustId;
    Reply: { id: string };
  }>(
    '/:id',
    {
      preHandler: [authorizeAccessToken()],
      schema: {
        tags: ['Investments'],
        summary: 'Delete investment operation',
        description:
          'Delete a standalone investment operation. ' +
          'Cash-flow operations linked to transactions cannot be deleted here.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteResponseSchema,
        },
      },
    },
    deleteOperationHandler,
  );
}
