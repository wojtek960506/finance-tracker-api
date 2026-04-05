import { FastifyReply, FastifyRequest } from 'fastify';

import { PaymentMethodsResponseDTO } from '@payment-method/schema';
import { AuthenticatedRequest } from '@shared/http';
import { listNamedResources } from '@shared/named-resource/services';

export const getPaymentMethodsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await listNamedResources<PaymentMethodsResponseDTO[number]>(
    'paymentMethod',
    userId,
  );
  return res.code(200).send(result);
};
