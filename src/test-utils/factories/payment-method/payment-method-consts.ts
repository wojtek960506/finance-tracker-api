import { Types } from "mongoose";
import { randomObjectIdString } from "@utils/random";


export const PAYMENT_METHOD_BANK_TRANSFER_NAME = "bankTransfer";
export const PAYMENT_METHOD_CASH_NAME = "cash";

export const BANK_TRANSFER_PAYMENT_METHOD_ID_STR = randomObjectIdString();
export const BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ = new Types.ObjectId(
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR
);
export const CASH_PAYMENT_METHOD_ID_STR = randomObjectIdString();
export const CASH_PAYMENT_METHOD_ID_OBJ = new Types.ObjectId(CASH_PAYMENT_METHOD_ID_STR);

export const PAYMENT_METHOD_TYPE_SYSTEM = "system";
export const PAYMENT_METHOD_TYPE_USER = "user";

