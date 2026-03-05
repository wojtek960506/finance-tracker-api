import { serializePaymentMethod } from "@schemas/serializers";
import { IPaymentMethod } from "@models/payment-method-model";
import { PaymentMethodResponseDTO } from "@schemas/payment-method";


export type PaymentMethodUpdateProps = Pick<PaymentMethodResponseDTO, "name" | "nameNormalized">;

export const savePaymentMethodChanges = async (
  paymentMethod: IPaymentMethod,
  newProps: PaymentMethodUpdateProps,
) => {
  Object.assign(paymentMethod, newProps);
  await paymentMethod.save();

  return serializePaymentMethod(paymentMethod);
}
