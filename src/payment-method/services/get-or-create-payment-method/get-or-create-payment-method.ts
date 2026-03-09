import { findPaymentMethodByName } from '@payment-method/db';
import { serializePaymentMethod } from '@payment-method/serializers';
import { createPaymentMethod } from '@payment-method/services';
import { getOrCreateNamedResource } from '@shared/named-resource';

export const getOrCreatePaymentMethod = (ownerId: string, name: string) => {
  return getOrCreateNamedResource({
    findByName: findPaymentMethodByName,
    serialize: serializePaymentMethod,
    create: createPaymentMethod,
  })(ownerId, name);
};
