import { checkOwner } from "@services/general";
import { findPaymentMethodById } from "@db/payment-methods";
import { PaymentMethodResponseDTO } from "@schemas/payment-method";
import { serializePaymentMethod } from "@schemas/serializers";


export const getPaymentMethod = async (
  paymentMethodId: string,
  ownerId: string
): Promise<PaymentMethodResponseDTO> => {
  const paymentMethod = await findPaymentMethodById(paymentMethodId);
  if (paymentMethod.type !== "system")
    checkOwner(ownerId, paymentMethodId, paymentMethod.ownerId!, "paymentMethod");
  return serializePaymentMethod(paymentMethod);
}
