import { IPaymentMethod } from '@payment-method/model';
import { PaymentMethodResponseDTO } from '@payment-method/schema';
import { serializeNamedResource } from '@shared/named-resource';

export const serializePaymentMethod = (
  paymentMethod: IPaymentMethod,
): PaymentMethodResponseDTO => {
  return serializeNamedResource<PaymentMethodResponseDTO>(paymentMethod);
};
