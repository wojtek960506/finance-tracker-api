import { FastifyReply, FastifyRequest } from 'fastify';

import { deletePaymentMethod } from '@payment-method/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const deletePaymentMethodHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const paymentMethodId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;

  const result = await deletePaymentMethod(paymentMethodId, userId);
  res.code(200).send(result);
};
