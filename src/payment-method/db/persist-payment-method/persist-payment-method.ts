import { PaymentMethodModel } from '@payment-method/model';
import { PaymentMethodResponseDTO } from '@payment-method/schema';
import { serializePaymentMethod } from '@payment-method/serializers';

export type PaymentMethodCreateProps = Omit<PaymentMethodResponseDTO, 'id'>;

export const persistPaymentMethod = async (props: PaymentMethodCreateProps) => {
  const newPaymentMethod = await PaymentMethodModel.create(props);
  return serializePaymentMethod(newPaymentMethod);
};
