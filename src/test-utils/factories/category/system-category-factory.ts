import {
  EXCHANGE_CATEGORY_ID_OBJ,
  EXCHANGE_CATEGORY_ID_STR,
  EXCHANGE_CATEGORY_NAME,
  TRANSFER_CATEGORY_ID_OBJ,
  TRANSFER_CATEGORY_ID_STR,
  TRANSFER_CATEGORY_NAME,
} from "./general-category-consts";


const commonProps = { type: "system", ownerId: undefined }
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
