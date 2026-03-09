import { PaymentMethodModel } from '@payment-method/model';
import { PaymentMethodResponseDTO } from '@payment-method/schema';
import { serializePaymentMethod } from '@payment-method/serializers';
import { NamedResourceCreateProps, persistNamedResource } from '@shared/named-resource';

export type PaymentMethodCreateProps = NamedResourceCreateProps &
  Omit<PaymentMethodResponseDTO, 'id'>;

export const persistPaymentMethod = async (props: PaymentMethodCreateProps) => {
  return persistNamedResource(PaymentMethodModel, props, serializePaymentMethod);
};
