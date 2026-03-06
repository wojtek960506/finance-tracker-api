import { FastifyReply, FastifyRequest } from "fastify";
import { PaymentMethodDTO } from "@schemas/payment-method";
import { updatePaymentMethod } from "@services/payment-methods";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";


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
