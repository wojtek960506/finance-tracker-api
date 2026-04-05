import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { deleteNamedResource } from '@shared/named-resource/services';

export const deletePaymentMethodHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const paymentMethodId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;

  const result = await deleteNamedResource('paymentMethod', paymentMethodId, userId);
  res.code(200).send(result);
};
