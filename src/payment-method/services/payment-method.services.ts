import { DeleteResult } from 'mongoose';

import {
  findPaymentMethodById,
  findPaymentMethodByName,
  findPaymentMethods,
  persistPaymentMethod,
  removePaymentMethod,
  savePaymentMethodChanges,
} from '@payment-method/db';
import { IPaymentMethod } from '@payment-method/model';
import { PaymentMethodDTO, PaymentMethodResponseDTO } from '@payment-method/schema';
import { serializePaymentMethod } from '@payment-method/serializers';
import {
  createNamedResource,
  deleteNamedResource,
  getNamedResource,
  prepareNamedResourcesMap,
  updateNamedResource,
} from '@shared/named-resource';
import {
  favoriteNamedResource,
  findFavoriteNamedResourceIds,
  getFavoriteNamedResources,
  persistFavoriteNamedResource,
  removeFavoriteNamedResource,
  unfavoriteNamedResource,
} from '@shared/named-resource-favorite';
import { ITransaction } from '@transaction/model';
// prettier-ignore
import {
  checkTransactionDependencies,
} from '@transaction/services/check-transaction-dependencies';
import {
  PaymentMethodAlreadyExistsError,
  PaymentMethodSystemNameConflictError,
  SystemPaymentMethodDeletionNotAllowed,
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
  systemNameConflictErrorFactory: (name) =>
    new PaymentMethodSystemNameConflictError(name),
});

export const getPaymentMethod = (paymentMethodId: string, ownerId: string) => {
  return getNamedResource<IPaymentMethod, PaymentMethodResponseDTO>({
    findById: findPaymentMethodById,
    serialize: serializePaymentMethod,
    checkOwnerType: 'paymentMethod',
  })(paymentMethodId, ownerId);
};

export const updatePaymentMethod = (
  paymentMethodId: string,
  ownerId: string,
  dto: PaymentMethodDTO,
) => {
  return updateNamedResource<IPaymentMethod, PaymentMethodResponseDTO>({
    findById: findPaymentMethodById,
    findByName: findPaymentMethodByName,
    saveChanges: savePaymentMethodChanges,
    checkOwnerType: 'paymentMethod',
    systemUpdateNotAllowedFactory: (resourceId) => {
      return new SystemPaymentMethodUpdateNotAllowed(resourceId);
    },
    userMissingOwnerFactory: (resourceId) => {
      return new UserPaymentMethodMissingOwner(resourceId);
    },
    alreadyExistsErrorFactory: (name) => new PaymentMethodAlreadyExistsError(name),
    systemNameConflictErrorFactory: (name) =>
      new PaymentMethodSystemNameConflictError(name),
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

export const getFavoritePaymentMethods = getFavoriteNamedResources<
  IPaymentMethod,
  PaymentMethodResponseDTO
>({
  resourceType: 'paymentMethod',
  findFavoriteIds: findFavoriteNamedResourceIds,
  findResources: findPaymentMethods,
  serialize: serializePaymentMethod,
});

export const favoritePaymentMethod = favoriteNamedResource<
  IPaymentMethod,
  PaymentMethodResponseDTO
>({
  resourceType: 'paymentMethod',
  findById: findPaymentMethodById,
  persistFavorite: persistFavoriteNamedResource,
  serialize: serializePaymentMethod,
  checkOwnerType: 'paymentMethod',
});

export const unfavoritePaymentMethod = (
  paymentMethodId: string,
  ownerId: string,
) => {
  return unfavoriteNamedResource<IPaymentMethod>({
    resourceType: 'paymentMethod',
    findById: findPaymentMethodById,
    removeFavorite: removeFavoriteNamedResource,
    checkOwnerType: 'paymentMethod',
  })(paymentMethodId, ownerId);
};

export const deletePaymentMethod = (
  paymentMethodId: string,
  ownerId: string,
): Promise<DeleteResult> => {
  return deleteNamedResource<IPaymentMethod>({
    findById: findPaymentMethodById,
    remove: removePaymentMethod,
    checkOwnerType: 'paymentMethod',
    checkOccurrences: (id) => checkTransactionDependencies('paymentMethodId', id),
    systemResourceDeleteErrorFactory: (id) =>
      new SystemPaymentMethodDeletionNotAllowed(id),
  })(paymentMethodId, ownerId);
};
