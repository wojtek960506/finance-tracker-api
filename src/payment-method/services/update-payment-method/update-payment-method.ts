import { findPaymentMethodById, savePaymentMethodChanges } from '@payment-method/db';
import { IPaymentMethod } from '@payment-method/model';
import { PaymentMethodDTO, PaymentMethodResponseDTO } from '@payment-method/schema';
import { updateNamedResource } from '@shared/named-resource';
import {
  SystemPaymentMethodUpdateNotAllowed,
  UserPaymentMethodMissingOwner,
} from '@utils/errors';

export const updatePaymentMethod = (
  paymentMethodId: string,
  ownerId: string,
  dto: PaymentMethodDTO,
) => {
  return updateNamedResource<IPaymentMethod, PaymentMethodResponseDTO>({
    findById: findPaymentMethodById,
    saveChanges: savePaymentMethodChanges,
    ownerType: 'paymentMethod',
    systemUpdateNotAllowedFactory: (resourceId) => {
      return new SystemPaymentMethodUpdateNotAllowed(resourceId);
    },
    userMissingOwnerFactory: (resourceId) => {
      return new UserPaymentMethodMissingOwner(resourceId);
    },
  })(paymentMethodId, ownerId, dto);
};
