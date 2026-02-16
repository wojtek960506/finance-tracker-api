import { Types } from "mongoose";
import { randomObjectIdString } from "@utils/random";


export const USER_ID_STR = randomObjectIdString();
export const USER_ID_OBJ = new Types.ObjectId(USER_ID_STR);

export const DATE_STR = "2026-02-05";
export const DATE_OBJ = new Date(DATE_STR);
export const DATE_ISO_STR = DATE_OBJ.toISOString();
