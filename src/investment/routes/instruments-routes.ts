import {
  InvestmentInstrumentDTO,
  InvestmentInstrumentFilterQuery,
  InvestmentInstrumentFilterQuerySchema,
  InvestmentInstrumentListResponseDTO,
  InvestmentInstrumentListResponseSchema,
  InvestmentInstrumentResponseDTO,
  InvestmentInstrumentResponseSchema,
  InvestmentInstrumentSchema,
  InvestmentInstrumentUpdateDTO,
  InvestmentInstrumentUpdateSchema,
} from '@investment/schema';
import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { authorizeAccessToken } from '@auth/services';
import { ParamsJustId, ParamsJustIdSchema } from '@shared/http';
import { validateBody } from '@utils/validation';

import {
  createInstrumentHandler,
  deleteInstrumentHandler,
  getInstrumentByIdHandler,
  getInstrumentsHandler,
  updateInstrumentHandler,
} from './handlers';

const DeleteResponseSchema = z.object({
  id: z.string(),
});

export async function instrumentsRoutes(app: FastifyInstance) {
  app.post<{
    Body: InvestmentInstrumentDTO;
    Reply: InvestmentInstrumentResponseDTO;
  }>(
    '/',
    {
      preHandler: [validateBody(InvestmentInstrumentSchema), authorizeAccessToken()],
      schema: {
        tags: ['Investments'],
        summary: 'Create investment instrument',
        description: 'Create a new investment instrument (holding/asset).',
        body: InvestmentInstrumentSchema,
        response: {
          201: InvestmentInstrumentResponseSchema,
        },
      },
    },
    createInstrumentHandler,
  );

  app.get<{
    Querystring: InvestmentInstrumentFilterQuery;
    Reply: InvestmentInstrumentListResponseDTO;
  }>(
    '/',
    {
      preHandler: [authorizeAccessToken()],
      schema: {
        tags: ['Investments'],
        summary: 'List investment instruments',
        description: 'Return list of investment instruments for the authenticated user.',
        querystring: InvestmentInstrumentFilterQuerySchema,
        response: {
          200: InvestmentInstrumentListResponseSchema,
        },
      },
    },
    getInstrumentsHandler,
  );

  app.get<{
    Params: ParamsJustId;
    Reply: InvestmentInstrumentResponseDTO;
  }>(
    '/:id',
    {
      preHandler: [authorizeAccessToken()],
      schema: {
        tags: ['Investments'],
        summary: 'Get investment instrument by id',
        description: 'Return a single investment instrument by id.',
        params: ParamsJustIdSchema,
        response: {
          200: InvestmentInstrumentResponseSchema,
        },
      },
    },
    getInstrumentByIdHandler,
  );

  app.patch<{
    Params: ParamsJustId;
    Body: InvestmentInstrumentUpdateDTO;
    Reply: InvestmentInstrumentResponseDTO;
  }>(
    '/:id',
    {
      preHandler: [
        validateBody(InvestmentInstrumentUpdateSchema),
        authorizeAccessToken(),
      ],
      schema: {
        tags: ['Investments'],
        summary: 'Update investment instrument',
        description: 'Update an investment instrument by id.',
        params: ParamsJustIdSchema,
        body: InvestmentInstrumentUpdateSchema,
        response: {
          200: InvestmentInstrumentResponseSchema,
        },
      },
    },
    updateInstrumentHandler,
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
        summary: 'Delete investment instrument',
        description:
          'Delete an investment instrument and its associated snapshot operations.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteResponseSchema,
        },
      },
    },
    deleteInstrumentHandler,
  );
}
