import { IPaymentMethod } from "@payment-method/model";
import { PaymentMethodResponseDTO } from "@payment-method/schema";


export const serializePaymentMethod = (
  paymentMethod: IPaymentMethod
): PaymentMethodResponseDTO => {
  const { _id, ownerId, __v, ...rest } = paymentMethod.toObject();
  return {
    ...rest,
    id: _id.toString(),
    ownerId: ownerId ? ownerId.toString() : undefined
  };
}
