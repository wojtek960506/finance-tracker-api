import { IPaymentMethod, PaymentMethodModel } from '@payment-method/model';
import { PaymentMethodResponseDTO } from '@payment-method/schema';
import { serializePaymentMethod } from '@payment-method/serializers';
import {
  findNamedResourceById,
  findNamedResourceByName,
  findNamedResources,
  NamedResourceCreateProps,
  NamedResourceUpdateProps,
  persistNamedResource,
  saveNamedResourceChanges,
} from '@shared/named-resource';
import { PaymentMethodNotFoundError } from '@utils/errors';

export type PaymentMethodCreateProps = NamedResourceCreateProps &
  Omit<PaymentMethodResponseDTO, 'id'>;

export type PaymentMethodUpdateProps = NamedResourceUpdateProps &
  Pick<PaymentMethodResponseDTO, 'name' | 'nameNormalized'>;

export const findPaymentMethodById = async (id: string) => {
  return findNamedResourceById(PaymentMethodModel, id, (paymentMethodId) => {
    return new PaymentMethodNotFoundError(paymentMethodId);
  });
};

export const findPaymentMethodByName = async (name: string, ownerId?: string) => {
  return findNamedResourceByName(PaymentMethodModel, name, ownerId);
};

export const findPaymentMethods = async (
  ownerId?: string,
  paymentMethodIds?: string[],
) => {
  return findNamedResources(PaymentMethodModel, ownerId, paymentMethodIds);
};

export const persistPaymentMethod = async (props: PaymentMethodCreateProps) => {
  return persistNamedResource(PaymentMethodModel, props, serializePaymentMethod);
};

export const savePaymentMethodChanges = async (
  paymentMethod: IPaymentMethod,
  newProps: PaymentMethodUpdateProps,
) => {
  return saveNamedResourceChanges(paymentMethod, newProps, serializePaymentMethod);
};
