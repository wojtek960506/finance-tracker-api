import { serializePaymentMethod } from "@schemas/serializers";
import { PaymentMethodModel } from "@models/payment-method-model";
import { PaymentMethodResponseDTO } from "@schemas/payment-method";


export type PaymentMethodCreateProps = Omit<PaymentMethodResponseDTO, "id" >;

export const persistPaymentMethod = async (props: PaymentMethodCreateProps) => {
  const newPaymentMethod = await PaymentMethodModel.create(props);
  return serializePaymentMethod(newPaymentMethod);
}
