import { AccountModel } from '@account/model';
import { upsertSystemNamedResources } from '@app/setup';
import { SYSTEM_ACCOUNT_NAMES } from '@utils/consts';

export const upsertSystemAccounts = async () =>
  upsertSystemNamedResources(AccountModel, SYSTEM_ACCOUNT_NAMES);
