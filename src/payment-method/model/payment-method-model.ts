import { createNamedResourceModel, INamedResource } from '@shared/named-resource/model';
import {
  NamedResourceAttributes,
  NamedResourceType,
} from '@shared/named-resource/types';

export type PaymentMethodType = NamedResourceType;

export type PaymentMethodAttributes = NamedResourceAttributes;

export type IPaymentMethod = INamedResource;

export const PaymentMethodModel = createNamedResourceModel<IPaymentMethod>(
  'PaymentMethod',
  'Invalid ownerId for payment method type',
);
