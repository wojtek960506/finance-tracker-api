import { DeleteResult } from 'mongoose';

import {
  findAccountById,
  findAccountByName,
  findAccounts,
  persistAccount,
  removeAccount,
  saveAccountChanges,
} from '@account/db';
import { IAccount } from '@account/model';
import { AccountDTO, AccountResponseDTO } from '@account/schema';
import { serializeAccount } from '@account/serializers';
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
  AccountAlreadyExistsError,
  AccountSystemNameConflictError,
  SystemAccountDeletionNotAllowed,
  SystemAccountUpdateNotAllowed,
  UserAccountMissingOwner,
} from '@utils/errors';

export const createAccount: (
  ownerId: string,
  dto: AccountDTO,
) => Promise<AccountResponseDTO> = createNamedResource<AccountDTO, AccountResponseDTO>({
  findByName: findAccountByName,
  persist: persistAccount,
  alreadyExistsErrorFactory: (name) => new AccountAlreadyExistsError(name),
  systemNameConflictErrorFactory: (name) => new AccountSystemNameConflictError(name),
});

export const getAccount = (accountId: string, ownerId: string) => {
  return getNamedResource<IAccount, AccountResponseDTO>({
    findById: findAccountById,
    serialize: serializeAccount,
    checkOwnerType: 'account',
  })(accountId, ownerId);
};

export const updateAccount = (accountId: string, ownerId: string, dto: AccountDTO) => {
  return updateNamedResource<IAccount, AccountResponseDTO>({
    findById: findAccountById,
    findByName: findAccountByName,
    saveChanges: saveAccountChanges,
    checkOwnerType: 'account',
    systemUpdateNotAllowedFactory: (resourceId) =>
      new SystemAccountUpdateNotAllowed(resourceId),
    userMissingOwnerFactory: (resourceId) => new UserAccountMissingOwner(resourceId),
    alreadyExistsErrorFactory: (name) => new AccountAlreadyExistsError(name),
    systemNameConflictErrorFactory: (name) => new AccountSystemNameConflictError(name),
  })(accountId, ownerId, dto);
};

export type AccountsMap = Record<
  string,
  Pick<AccountResponseDTO, 'id' | 'type' | 'name'>
>;

export const prepareAccountsMap = async (
  ownerId: string,
  transactions?: Pick<ITransaction, 'accountId'>[],
) => {
  const accountIds = transactions?.map((t) => t.accountId.toString());
  const accounts = await findAccounts(ownerId, accountIds);
  return prepareNamedResourcesMap(accounts);
};

export const getFavoriteAccounts = getFavoriteNamedResources<
  IAccount,
  AccountResponseDTO
>({
  resourceType: 'account',
  findFavoriteIds: findFavoriteNamedResourceIds,
  findResources: findAccounts,
  serialize: serializeAccount,
});

export const favoriteAccount = favoriteNamedResource<IAccount, AccountResponseDTO>({
  resourceType: 'account',
  findById: findAccountById,
  persistFavorite: persistFavoriteNamedResource,
  serialize: serializeAccount,
  checkOwnerType: 'account',
});

export const unfavoriteAccount = (accountId: string, ownerId: string) => {
  return unfavoriteNamedResource<IAccount>({
    resourceType: 'account',
    findById: findAccountById,
    removeFavorite: removeFavoriteNamedResource,
    checkOwnerType: 'account',
  })(accountId, ownerId);
};

export const deleteAccount = (
  accountId: string,
  ownerId: string,
): Promise<DeleteResult> => {
  return deleteNamedResource<IAccount>({
    findById: findAccountById,
    remove: removeAccount,
    checkOwnerType: 'account',
    checkOccurrences: (id) => checkTransactionDependencies('accountId', id),
    systemResourceDeleteErrorFactory: (id) => new SystemAccountDeletionNotAllowed(id),
  })(accountId, ownerId);
};
