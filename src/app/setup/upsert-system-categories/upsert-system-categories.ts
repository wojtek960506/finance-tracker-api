import { upsertSystemNamedResources } from '@app/setup';
import { CategoryModel } from '@category/model';
import { SYSTEM_CATEGORY_NAMES } from '@utils/consts';

export const upsertSystemCategories = async () =>
  upsertSystemNamedResources(CategoryModel, SYSTEM_CATEGORY_NAMES);
