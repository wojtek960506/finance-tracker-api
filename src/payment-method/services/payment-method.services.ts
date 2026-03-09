import {
  findPaymentMethodById,
  findPaymentMethodByName,
  findPaymentMethods,
  persistPaymentMethod,
  savePaymentMethodChanges,
} from '@payment-method/db';
import { IPaymentMethod } from '@payment-method/model';
import { PaymentMethodDTO, PaymentMethodResponseDTO } from '@payment-method/schema';
import { serializePaymentMethod } from '@payment-method/serializers';
import {
  createNamedResource,
  getNamedResource,
  prepareNamedResourcesMap,
  updateNamedResource,
} from '@shared/named-resource';
import { ITransaction } from '@transaction/model';
import {
  PaymentMethodAlreadyExistsError,
  SystemPaymentMethodUpdateNotAllowed,
  UserPaymentMethodMissingOwner,
} from '@utils/errors';

export const createPaymentMethod: (
  ownerId: string,
  dto: PaymentMethodDTO,
) => Promise<PaymentMethodResponseDTO> = createNamedResource<
  PaymentMethodDTO,
  PaymentMethodResponseDTO
>({
  findByName: findPaymentMethodByName,
  persist: persistPaymentMethod,
  alreadyExistsErrorFactory: (name) => new PaymentMethodAlreadyExistsError(name),
});

export const getPaymentMethod = (paymentMethodId: string, ownerId: string) => {
  return getNamedResource<IPaymentMethod, PaymentMethodResponseDTO>({
    findById: findPaymentMethodById,
    serialize: serializePaymentMethod,
    ownerType: 'paymentMethod',
  })(paymentMethodId, ownerId);
};

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

export type PaymentMethodsMap = Record<
  string,
  Pick<PaymentMethodResponseDTO, 'id' | 'type' | 'name'>
>;

export const preparePaymentMethodsMap = async (
  ownerId: string,
  transactions?: Pick<ITransaction, 'paymentMethodId'>[],
) => {
  const paymentMethodIds = transactions?.map((t) => t.paymentMethodId.toString());
  const paymentMethods = await findPaymentMethods(ownerId, paymentMethodIds);
  return prepareNamedResourcesMap(paymentMethods);
};
