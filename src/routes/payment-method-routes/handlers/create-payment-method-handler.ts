import { FastifyReply, FastifyRequest } from "fastify";
import { PaymentMethodDTO } from "@schemas/payment-method";
import { AuthenticatedRequest } from "@routes/routes-types";
import { createPaymentMethod } from "@services/payment-methods";


export const createPaymentMethodHandler = async (
  req: FastifyRequest<{ Body: PaymentMethodDTO }>,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const result = await createPaymentMethod(ownerId, req.body);
  return res.code(201).send(result);
}
