import { findPaymentMethodByName } from "@db/payment-methods";
import { serializePaymentMethod } from "@schemas/serializers";
import { createPaymentMethod } from "@services/payment-methods";


export const getOrCreatePaymentMethod = async (ownerId: string, name: string) => {
  const paymentMethod = await findPaymentMethodByName(name, ownerId);
  if (paymentMethod) return serializePaymentMethod(paymentMethod);
  return createPaymentMethod(ownerId, { name });
}
