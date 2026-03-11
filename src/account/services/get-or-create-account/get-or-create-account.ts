import { findAccountByName } from '@account/db';
import { serializeAccount } from '@account/serializers';
import { createAccount } from '@account/services';
import { getOrCreateNamedResource } from '@shared/named-resource';

export const getOrCreateAccount = (ownerId: string, name: string) => {
  return getOrCreateNamedResource({
    findByName: findAccountByName,
    serialize: serializeAccount,
    create: createAccount,
  })(ownerId, name);
};
