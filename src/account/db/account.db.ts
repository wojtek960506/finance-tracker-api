import { DeleteResult } from 'mongoose';

import { AccountModel, IAccount } from '@account/model';
import { AccountResponseDTO } from '@account/schema';
import { serializeAccount } from '@account/serializers';
import {
  findNamedResourceById,
  findNamedResourceByName,
  findNamedResources,
  NamedResourceCreateProps,
  NamedResourceUpdateProps,
  persistNamedResource,
  removeNamedResourceById,
  saveNamedResourceChanges,
} from '@shared/named-resource';
import { AccountNotFoundError } from '@utils/errors';

export type AccountCreateProps = NamedResourceCreateProps &
  Omit<AccountResponseDTO, 'id'>;

export type AccountUpdateProps = NamedResourceUpdateProps &
  Pick<AccountResponseDTO, 'name' | 'nameNormalized'>;

export const findAccountById = async (id: string) => {
  return findNamedResourceById(AccountModel, id, (accountId) => {
    return new AccountNotFoundError(accountId);
  });
};

export const findAccountByName = async (name: string, ownerId?: string) => {
  return findNamedResourceByName(AccountModel, name, ownerId);
};

export const findAccounts = async (ownerId?: string, accountIds?: string[]) => {
  return findNamedResources(AccountModel, ownerId, accountIds);
};

export const persistAccount = async (props: AccountCreateProps) => {
  return persistNamedResource(AccountModel, props, serializeAccount);
};

export const saveAccountChanges = async (
  account: IAccount,
  newProps: AccountUpdateProps,
) => {
  return saveNamedResourceChanges(account, newProps, serializeAccount);
};

export const removeAccount = async (id: string): Promise<DeleteResult> => {
  return removeNamedResourceById(AccountModel, id, (accountId) => {
    return new AccountNotFoundError(accountId);
  });
};
