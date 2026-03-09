import { IPaymentMethod } from '@payment-method/model';
import { PaymentMethodResponseDTO } from '@payment-method/schema';
import { serializePaymentMethod } from '@payment-method/serializers';
import {
  NamedResourceUpdateProps,
  saveNamedResourceChanges,
} from '@shared/named-resource';

export type PaymentMethodUpdateProps = NamedResourceUpdateProps &
  Pick<PaymentMethodResponseDTO, 'name' | 'nameNormalized'>;

export const savePaymentMethodChanges = async (
  paymentMethod: IPaymentMethod,
  newProps: PaymentMethodUpdateProps,
) => {
  return saveNamedResourceChanges(paymentMethod, newProps, serializePaymentMethod);
};
