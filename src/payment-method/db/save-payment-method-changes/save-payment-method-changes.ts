import { IPaymentMethod } from "@payment-method/model";
import { serializePaymentMethod } from "@payment-method/serializers";
import { PaymentMethodResponseDTO } from "@payment-method/schema";


export type PaymentMethodUpdateProps = Pick<PaymentMethodResponseDTO, "name" | "nameNormalized">;

export const savePaymentMethodChanges = async (
  paymentMethod: IPaymentMethod,
  newProps: PaymentMethodUpdateProps,
) => {
  Object.assign(paymentMethod, newProps);
  await paymentMethod.save();

  return serializePaymentMethod(paymentMethod);
}
