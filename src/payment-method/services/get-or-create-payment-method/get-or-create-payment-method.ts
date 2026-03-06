import { findPaymentMethodByName } from "@payment-method/db"
import { createPaymentMethod } from "@payment-method/services"
import { serializePaymentMethod } from "@payment-method/serializers"


export const getOrCreatePaymentMethod = async (ownerId: string, name: string) => {
  const paymentMethod = await findPaymentMethodByName(name, ownerId);
  if (paymentMethod) return serializePaymentMethod(paymentMethod);
  return createPaymentMethod(ownerId, { name });
}
