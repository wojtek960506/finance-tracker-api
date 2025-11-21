import { IUser } from "@models/user-model";
import { UserResponseDTO } from "@schemas/user"

export const serializeUser = (user: IUser): UserResponseDTO => {
  const {
    passwordHash,
    refreshTokenHashes,
    _id,
    __v,
    ...rest
  } = user.toObject();
  return {
    ...rest,
    id: _id.toString(),
  }
}