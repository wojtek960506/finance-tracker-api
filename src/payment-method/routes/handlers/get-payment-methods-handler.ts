import { FastifyReply, FastifyRequest } from "fastify";
import { findPaymentMethods } from "@payment-method/db";
import { AuthenticatedRequest } from "@shared/http";
import { serializePaymentMethod } from "@payment-method/serializers";


export const getPaymentMethodsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await findPaymentMethods(userId);
  return res.code(200).send(result.map(c => serializePaymentMethod(c)));
}
