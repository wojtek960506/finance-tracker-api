import { PaymentMethodModel } from '@payment-method/model';
import { findNamedResourceById, findNamedResourceByName } from '@shared/named-resource';
import { PaymentMethodNotFoundError } from '@utils/errors';

export const findPaymentMethodById = async (id: string) => {
  return findNamedResourceById(PaymentMethodModel, id, (paymentMethodId) => {
    return new PaymentMethodNotFoundError(paymentMethodId);
  });
};

export const findPaymentMethodByName = async (name: string, ownerId?: string) => {
  return findNamedResourceByName(PaymentMethodModel, name, ownerId);
};
