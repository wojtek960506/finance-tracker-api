import { upsertSystemNamedResources } from '@app/setup';
import { getNamedResourceModel } from '@named-resource';
import { SYSTEM_SPORT_CATEGORY_NAMES } from '@utils/consts';

export const upsertSystemSportCategories = async () =>
  upsertSystemNamedResources(
    getNamedResourceModel('sportCategory'),
    SYSTEM_SPORT_CATEGORY_NAMES,
  );
