import { findPaymentMethodById } from '@payment-method/db';
import { IPaymentMethod } from '@payment-method/model';
import { PaymentMethodResponseDTO } from '@payment-method/schema';
import { serializePaymentMethod } from '@payment-method/serializers';
import { getNamedResource } from '@shared/named-resource';

export const getPaymentMethod = (paymentMethodId: string, ownerId: string) => {
  return getNamedResource<IPaymentMethod, PaymentMethodResponseDTO>({
    findById: findPaymentMethodById,
    serialize: serializePaymentMethod,
    ownerType: 'paymentMethod',
  })(paymentMethodId, ownerId);
};
