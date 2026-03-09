import { PaymentMethodModel } from '@payment-method/model';
import { findNamedResources } from '@shared/named-resource';

export const findPaymentMethods = async (
  ownerId?: string,
  paymentMethodIds?: string[],
) => {
  return findNamedResources(PaymentMethodModel, ownerId, paymentMethodIds);
};
