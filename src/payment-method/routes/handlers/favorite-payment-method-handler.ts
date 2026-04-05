import { FastifyReply, FastifyRequest } from 'fastify';

import { PaymentMethodResponseDTO } from '@payment-method/schema';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { favoriteNamedResource } from '@shared/named-resource/services';

export const favoritePaymentMethodHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const paymentMethodId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await favoriteNamedResource<PaymentMethodResponseDTO>(
    'paymentMethod',
    paymentMethodId,
    userId,
  );
  return res.code(200).send(result);
};
