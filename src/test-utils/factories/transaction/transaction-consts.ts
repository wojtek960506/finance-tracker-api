import { randomObjectIdString } from "@utils/random";
import { Types } from "mongoose";


export const DATE_STR = "2026-02-05";
export const DATE_OBJ = new Date(DATE_STR);
export const DATE_ISO_STR = DATE_OBJ.toISOString();

export const AMOUNT_EXPENSE = 423;
export const AMOUNT_INCOME = 100;
export const CURRENCY_EXPENSE = "PLN";
export const CURRENCY_INCOME = "EUR";
export const ACCOUNT_EXPENSE = "mBank";
export const ACCOUNT_INCOME = "veloBank";
export const PAYMENT_METHOD = "bankTransfer";
export const DESCRPTION = "some description";
export const TRANSACTION_TYPE_INCOME = "income";
export const TRANSACTION_TYPE_EXPENSE = "expense";

export const STANDARD_TXN_ID_STR = randomObjectIdString();
export const STANDARD_TXN_ID_OBJ = new Types.ObjectId(STANDARD_TXN_ID_STR);
export const STANDARD_TXN_SRC_IDX = 1;

export const EXCHANGE_TXN_EXPENSE_ID_STR = randomObjectIdString();
export const EXCHANGE_TXN_EXPENSE_ID_OBJ = new Types.ObjectId(EXCHANGE_TXN_EXPENSE_ID_STR);
export const EXCHANGE_TXN_INCOME_ID_STR = randomObjectIdString();
export const EXCHANGE_TXN_INCOME_ID_OBJ = new Types.ObjectId(EXCHANGE_TXN_INCOME_ID_STR);
export const EXCHANGE_TXN_EXPENSE_SRC_IDX = 2;
export const EXCHANGE_TXN_INCOME_SRC_IDX = 3;

export const TRANSFER_TXN_EXPENSE_ID_STR = randomObjectIdString();
export const TRANSFER_TXN_EXPENSE_ID_OBJ = new Types.ObjectId(TRANSFER_TXN_EXPENSE_ID_STR);
export const TRANSFER_TXN_INCOME_ID_STR = randomObjectIdString();
export const TRANSFER_TXN_INCOME_ID_OBJ = new Types.ObjectId(TRANSFER_TXN_INCOME_ID_STR);
export const TRANSFER_TXN_EXPENSE_SRC_IDX = 4;
export const TRANSFER_TXN_INCOME_SRC_IDX = 5;


export const START_DATE_FILTER = new Date("2015-01-01");
export const END_DATE_FILTER = new Date("2025-12-31");
export const MIN_AMOUNT_FILTER = 1.11;
export const MAX_AMOUNT_FILTER = 2.22;
