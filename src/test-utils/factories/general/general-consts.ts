import { Types } from "mongoose";
import { randomObjectIdString } from "@utils/random";


export const USER_ID_STR = randomObjectIdString();
export const USER_ID_OBJ = new Types.ObjectId(USER_ID_STR);
