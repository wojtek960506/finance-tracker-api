import { IUser } from "@users/model";
import { UserResponseDTO } from "@users/schema";


export const serializeUser = (user: IUser): UserResponseDTO => {
  const {
    passwordHash,
    refreshTokenHash,
    _id,
    __v,
    ...rest
  } = user.toObject();
  return {
    ...rest,
    id: _id.toString(),
  }
}