import { IPaymentMethod } from '@payment-method/model';
import { PaymentMethodResponseDTO } from '@payment-method/schema';
import { serializePaymentMethod } from '@payment-method/serializers';

export type PaymentMethodUpdateProps = Pick<
  PaymentMethodResponseDTO,
  'name' | 'nameNormalized'
>;

export const savePaymentMethodChanges = async (
  paymentMethod: IPaymentMethod,
  newProps: PaymentMethodUpdateProps,
) => {
  Object.assign(paymentMethod, newProps);
  await paymentMethod.save();

  return serializePaymentMethod(paymentMethod);
};
