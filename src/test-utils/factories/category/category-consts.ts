import { Types } from "mongoose";
import { randomObjectIdString } from "@utils/random";


export const FOOD_CATEGORY_ID_STR = randomObjectIdString();
export const FOOD_CATEGORY_ID_OBJ = new Types.ObjectId(FOOD_CATEGORY_ID_STR);
export const EXCHANGE_CATEGORY_ID_STR = randomObjectIdString();
export const EXCHANGE_CATEGORY_ID_OBJ = new Types.ObjectId(EXCHANGE_CATEGORY_ID_STR);
export const TRANSFER_CATEGORY_ID_STR = randomObjectIdString();
export const TRANSFER_CATEGORY_ID_OBJ = new Types.ObjectId(TRANSFER_CATEGORY_ID_STR);

export const TRANSFER_CATEGORY_NAME = "myAccount";
export const EXCHANGE_CATEGORY_NAME = "exchange";
export const FOOD_CATEGORY_NAME = "Food";

export const CATEGORY_TYPE_SYSTEM = "system";
export const CATEGORY_TYPE_USER = "user";
