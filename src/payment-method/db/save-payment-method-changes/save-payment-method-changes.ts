import { IPaymentMethod } from "@payment-method/model";
import { serializePaymentMethod } from "@schemas/serializers";
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
