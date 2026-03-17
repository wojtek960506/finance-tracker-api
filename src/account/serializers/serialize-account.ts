import { IAccount } from '@account/model';
import { AccountResponseDTO } from '@account/schema';
import { serializeNamedResource } from '@shared/named-resource';

export const serializeAccount = (account: IAccount): AccountResponseDTO => {
  return serializeNamedResource<AccountResponseDTO>(account);
};
