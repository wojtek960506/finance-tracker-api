import { FastifyReply, FastifyRequest } from 'fastify';

import { PaymentMethodResponseDTO } from '@payment-method/schema';
import { AuthenticatedRequest } from '@shared/http';
import { getFavoriteNamedResources } from '@shared/named-resource/services';

export const getFavoritePaymentMethodsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getFavoriteNamedResources<PaymentMethodResponseDTO>(
    'paymentMethod',
    userId,
  );
  return res.code(200).send(result);
};
