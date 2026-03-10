import { FastifyInstance } from 'fastify';
import { DeleteResult } from 'mongoose';

import { authorizeAccessToken } from '@auth/services';
import {
  PaymentMethodDTO,
  PaymentMethodResponseDTO,
  PaymentMethodSchema,
  PaymentMethodsResponseDTO,
} from '@payment-method/schema';
import { ParamsJustId } from '@shared/http';
import { validateBody } from '@utils/validation';

import {
  createPaymentMethodHandler,
  deletePaymentMethodHandler,
  getPaymentMethodHandler,
  getPaymentMethodsHandler,
  updatePaymentMethodHandler,
} from './handlers';

export async function paymentMethodRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{ Reply: PaymentMethodsResponseDTO }>(
    '/',
    { preHandler: authorizeAccessToken() },
    getPaymentMethodsHandler,
  );

  app.get<{ Params: ParamsJustId; Reply: PaymentMethodResponseDTO }>(
    '/:id',
    { preHandler: authorizeAccessToken() },
    getPaymentMethodHandler,
  );

  app.post<{ Body: PaymentMethodDTO; Reply: PaymentMethodResponseDTO }>(
    '/',
    { preHandler: [validateBody(PaymentMethodSchema), authorizeAccessToken()] },
    createPaymentMethodHandler,
  );

  app.put<{
    Params: ParamsJustId;
    Body: PaymentMethodDTO;
    Reply: PaymentMethodResponseDTO;
  }>(
    '/:id',
    { preHandler: [validateBody(PaymentMethodSchema), authorizeAccessToken()] },
    updatePaymentMethodHandler,
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteResult }>(
    '/:id',
    { preHandler: authorizeAccessToken() },
    deletePaymentMethodHandler,
  );
}
