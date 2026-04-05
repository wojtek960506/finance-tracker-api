import { upsertSystemNamedResources } from '@app/setup';
import { getNamedResourceModel } from '@shared/named-resource';
import { SYSTEM_ACCOUNT_NAMES } from '@utils/consts';

export const upsertSystemAccounts = async () =>
  upsertSystemNamedResources(getNamedResourceModel('account'), SYSTEM_ACCOUNT_NAMES);
