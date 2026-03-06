import { FastifyReply, FastifyRequest } from "fastify";
import { PaymentMethodDTO } from "@payment-method/schema";
import { updatePaymentMethod } from "@payment-method/services";
import { AuthenticatedRequest, ParamsJustId } from "@shared/http";


export const updatePaymentMethodHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId, Body: PaymentMethodDTO }>,
  res: FastifyReply,
) => {
  const paymentMethodId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const dto = req.body;

  const result = await updatePaymentMethod(paymentMethodId, userId, dto);
  res.code(200).send(result);
}
