import { checkOwner } from "@shared/services";
import { findPaymentMethodById } from "@payment-method/db";
import { serializePaymentMethod } from "@payment-method/serializers";
import { PaymentMethodResponseDTO } from "@payment-method/schema";


export const getPaymentMethod = async (
  paymentMethodId: string,
  ownerId: string
): Promise<PaymentMethodResponseDTO> => {
  const paymentMethod = await findPaymentMethodById(paymentMethodId);
  if (paymentMethod.type !== "system")
    checkOwner(ownerId, paymentMethodId, paymentMethod.ownerId!, "paymentMethod");
  return serializePaymentMethod(paymentMethod);
}
