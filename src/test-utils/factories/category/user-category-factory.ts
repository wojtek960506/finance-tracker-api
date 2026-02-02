import { Types } from "mongoose";
import { CATEGORY_OWNER_ID, USER_CATEGORY_ID } from "./general-category-consts";


const commonProps = { type: "user", name: "Food", nameNormalized: "food" }

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
