import {
  createNamedResourceModel,
  INamedResource,
  NamedResourceAttributes,
  NamedResourceType,
} from '@shared/named-resource';

export type AccountType = NamedResourceType;

export type AccountAttributes = NamedResourceAttributes;

export type IAccount = INamedResource;

export const AccountModel = createNamedResourceModel<IAccount>(
  'Account',
  'Invalid ownerId for account type',
);
