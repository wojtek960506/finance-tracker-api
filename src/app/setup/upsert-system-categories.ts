import { upsertSystemNamedResources } from "@app/setup";
import { SYSTEM_CATEGORY_NAMES } from "@utils/consts";

import { CategoryModel } from "@/category/model";

export const upsertSystemCategories = async () =>
  upsertSystemNamedResources(CategoryModel, SYSTEM_CATEGORY_NAMES);
