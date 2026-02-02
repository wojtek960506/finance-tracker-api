import { Types } from "mongoose";
import { SYSTEM_CATEGORY_ID } from "./general-category-consts";


const commonProps = { 
  type: "system",
  name: "exchange",
  nameNormalized: "exchange",
  ownerId: undefined,
}

export const getSystemCategoryResultJSON = () => ({
  ...commonProps,
  _id: new Types.ObjectId(SYSTEM_CATEGORY_ID),
});

export const getSystemCategoryResultSerialized = () => ({
  ...commonProps,
  id: SYSTEM_CATEGORY_ID,
});
