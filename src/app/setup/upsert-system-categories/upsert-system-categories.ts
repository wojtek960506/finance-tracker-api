import { upsertSystemNamedResources } from '@app/setup';
import { getNamedResourceModel } from '@shared/named-resource';
import { SYSTEM_CATEGORY_NAMES } from '@utils/consts';

export const upsertSystemCategories = async () =>
  upsertSystemNamedResources(getNamedResourceModel('category'), SYSTEM_CATEGORY_NAMES);
