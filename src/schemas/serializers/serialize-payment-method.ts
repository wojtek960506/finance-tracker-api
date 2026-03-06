import { IPaymentMethod } from "@models/payment-method-model";
import { PaymentMethodResponseDTO } from "@schemas/payment-method";


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
