import { FastifyReply, FastifyRequest } from "fastify";
import { PaymentMethodDTO } from "@payment-method/schema";
import { AuthenticatedRequest } from "@shared/http";
import { createPaymentMethod } from "@payment-method/services";


export const createPaymentMethodHandler = async (
  req: FastifyRequest<{ Body: PaymentMethodDTO }>,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const result = await createPaymentMethod(ownerId, req.body);
  return res.code(201).send(result);
}
