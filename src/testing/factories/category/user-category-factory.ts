import { NamedResourceType } from '@named-resource';
import { USER_ID_OBJ, USER_ID_STR } from '@testing/factories/general';

import {
  CATEGORY_TYPE_USER,
  FOOD_CATEGORY_ID_OBJ,
  FOOD_CATEGORY_ID_STR,
  FOOD_CATEGORY_NAME,
} from './category-consts';

const commonProps = {
  type: CATEGORY_TYPE_USER as NamedResourceType,
  name: FOOD_CATEGORY_NAME,
  nameNormalized: FOOD_CATEGORY_NAME.toLowerCase(),
};

export const getUserCategoryProps = () => ({
  ...commonProps,
  ownerId: USER_ID_STR,
});

export const getUpdateCategoryProps = () => ({ name: FOOD_CATEGORY_NAME });

export const getUserCategoryResultJSON = () => ({
  ...commonProps,
  ownerId: USER_ID_OBJ,
  _id: FOOD_CATEGORY_ID_OBJ,
});

export const getUserCategoryResultSerialized = () => ({
  ...commonProps,
  ownerId: USER_ID_STR,
  id: FOOD_CATEGORY_ID_STR,
  isFavorite: false,
});
