import { PaymentMethodModel } from "@payment-method/model";
import { serializePaymentMethod } from "@payment-method/serializers";
import { PaymentMethodResponseDTO } from "@payment-method/schema";


export type PaymentMethodCreateProps = Omit<PaymentMethodResponseDTO, "id" >;

export const persistPaymentMethod = async (props: PaymentMethodCreateProps) => {
  const newPaymentMethod = await PaymentMethodModel.create(props);
  return serializePaymentMethod(newPaymentMethod);
}
