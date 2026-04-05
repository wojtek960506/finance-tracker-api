import { FastifyReply, FastifyRequest } from 'fastify';

import { getFavoritePaymentMethods } from '@payment-method/services';
import { AuthenticatedRequest } from '@shared/http';

export const getFavoritePaymentMethodsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getFavoritePaymentMethods(userId);
  return res.code(200).send(result);
};
