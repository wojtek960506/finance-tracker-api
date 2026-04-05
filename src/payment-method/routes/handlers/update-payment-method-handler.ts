import { FastifyReply, FastifyRequest } from 'fastify';

import { PaymentMethodDTO } from '@payment-method/schema';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { updateNamedResource } from '@shared/named-resource/services';

export const updatePaymentMethodHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId; Body: PaymentMethodDTO }>,
  res: FastifyReply,
) => {
  const paymentMethodId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const dto = req.body;

  const result = await updateNamedResource<PaymentMethodDTO>(
    'paymentMethod',
    paymentMethodId,
    userId,
    dto,
  );
  res.code(200).send(result);
};
