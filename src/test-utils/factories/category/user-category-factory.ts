import { Types } from "mongoose";
import { CategoryType } from "@models/category-model";
import { CATEGORY_OWNER_ID, USER_CATEGORY_ID } from "./general-category-consts";


const commonProps = { type: "user" as CategoryType, name: "Food", nameNormalized: "food" }

export const getUserCategoryProps = () => ({
  ...commonProps,
  ownerId: CATEGORY_OWNER_ID,
});

export const getUpdateCategoryProps = () => ({ name: "Food" });

export const getUserCategoryResultJSON = () => ({
  ...commonProps,
  _id: new Types.ObjectId(USER_CATEGORY_ID),
  ownerId: new Types.ObjectId(CATEGORY_OWNER_ID),
});

export const getUserCategoryResultSerialized = () => ({
  ...commonProps,
  id: USER_CATEGORY_ID,
  ownerId: CATEGORY_OWNER_ID,
});
