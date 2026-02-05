import { CategoryType } from "@models/category-model";
import {
  CATEGORY_TYPE_SYSTEM,
  EXCHANGE_CATEGORY_NAME,
  TRANSFER_CATEGORY_NAME,
  EXCHANGE_CATEGORY_ID_OBJ,
  EXCHANGE_CATEGORY_ID_STR,
  TRANSFER_CATEGORY_ID_OBJ,
  TRANSFER_CATEGORY_ID_STR,
} from "./category-consts";


const commonProps = { type: CATEGORY_TYPE_SYSTEM as CategoryType, ownerId: undefined }
const propsTransfer = {
  name: TRANSFER_CATEGORY_NAME,
  nameNormalized: TRANSFER_CATEGORY_NAME.toLowerCase(),
}
const propsExchange = {
  name: EXCHANGE_CATEGORY_NAME,
  nameNormalized: EXCHANGE_CATEGORY_NAME.toLowerCase(),
}

export const getExchangeCategoryResultJSON = () => ({
  ...commonProps,
  ...propsExchange,
  _id: EXCHANGE_CATEGORY_ID_OBJ,
});

export const getExchangeCategoryResultSerialized = () => ({
  ...commonProps,
  ...propsExchange,
  id: EXCHANGE_CATEGORY_ID_STR,
});

export const getTransferCategoryResultJSON = () => ({
  ...commonProps,
  ...propsTransfer,
  _id: TRANSFER_CATEGORY_ID_OBJ,
});

export const getTransferCategoryResultSerialized = () => ({
  ...commonProps,
  ...propsTransfer,
  id: TRANSFER_CATEGORY_ID_STR,
});
