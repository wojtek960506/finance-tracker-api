import { Types } from "mongoose";
import { TransactionOwnershipError } from "@utils/errors";
import { CategoryOwnershipError } from "@utils/errors/category-errors";


export type CheckOwnerType = "transaction" | "category";

export const checkOwner = (
  userId: string | Types.ObjectId,
  objectId: string | Types.ObjectId,
  ownerId: string | Types.ObjectId,
  objectType: CheckOwnerType,
) => {
  userId = userId.toString();
  objectId = objectId.toString();
  ownerId = ownerId.toString();

  if (userId !== ownerId)
    switch (objectType) {
      case "transaction":
        throw new TransactionOwnershipError(userId, objectId, ownerId);
      case "category":
        throw new CategoryOwnershipError(userId, objectId, ownerId);
    }    
}