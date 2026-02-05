import { CategoryType } from "@models/category-model";
import {
  FOOD_CATEGORY_NAME,
  FOOD_CATEGORY_ID_OBJ,
  FOOD_CATEGORY_ID_STR,
} from "./general-category-consts";
import { USER_ID_OBJ, USER_ID_STR } from "@/test-utils/factories/general-consts";


const commonProps = {
  type: "user" as CategoryType,
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
});
