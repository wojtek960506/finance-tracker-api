import { createNamedResourceModel, INamedResource } from '@shared/named-resource/model';
import { NamedResourceAttributes, NamedResourceType } from '@shared/named-resource/types';

export type AccountType = NamedResourceType;

export type AccountAttributes = NamedResourceAttributes;

export type IAccount = INamedResource;

export const AccountModel = createNamedResourceModel<IAccount>(
  'Account',
  'Invalid ownerId for account type',
);
