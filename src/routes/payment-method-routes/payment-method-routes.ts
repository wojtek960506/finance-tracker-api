import { FastifyInstance } from "fastify";
import { validateBody } from "@utils/validation";
import { ParamsJustId } from "@routes/routes-types";
import { authorizeAccessToken } from "@auth/services";
import {
  getPaymentMethodHandler,
  getPaymentMethodsHandler,
  createPaymentMethodHandler,
  updatePaymentMethodHandler,
} from "./handlers";
import {
  PaymentMethodDTO,
  PaymentMethodSchema,
  PaymentMethodResponseDTO,
  PaymentMethodsResponseDTO,
} from "@schemas/payment-method";


export async function paymentMethodRoutes(
  app: FastifyInstance & { withTypeProvider: <T>() => any }
) {

  app.get<{ Reply: PaymentMethodsResponseDTO }>(
    "/",
    { preHandler: authorizeAccessToken() },
    getPaymentMethodsHandler,
  );

  app.get<{ Params: ParamsJustId, Reply: PaymentMethodResponseDTO }>(
    "/:id",
    { preHandler: authorizeAccessToken() },
    getPaymentMethodHandler,
  );

  app.post<{ Body: PaymentMethodDTO, Reply: PaymentMethodResponseDTO }>(
    "/",
    { preHandler: [validateBody(PaymentMethodSchema), authorizeAccessToken()] },
    createPaymentMethodHandler,
  );

  app.put<{ Params: ParamsJustId, Body: PaymentMethodDTO, Reply: PaymentMethodResponseDTO }>(
    "/:id",
    { preHandler: [validateBody(PaymentMethodSchema), authorizeAccessToken()] },
    updatePaymentMethodHandler,
  )
}
