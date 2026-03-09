import {
  createNamedResourceModel,
  INamedResource,
  NamedResourceAttributes,
  NamedResourceType,
} from '@shared/named-resource';

export type PaymentMethodType = NamedResourceType;

export type PaymentMethodAttributes = NamedResourceAttributes;

export type IPaymentMethod = INamedResource;

export const PaymentMethodModel = createNamedResourceModel<IPaymentMethod>(
  'PaymentMethod',
  'Invalid ownerId for payment method type',
);
