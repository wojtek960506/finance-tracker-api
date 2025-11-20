import { IUser } from "@models/User"
import { UserResponseDTO, UserSensitiveResponseDTO } from "@schemas/user"

export const getNotSensitiveUser = (user: UserSensitiveResponseDTO): UserResponseDTO => {
  const obj = (user as any).toObject ? (user as any).toObject() : user;
  const { passwordHash, refreshTokenHashes, ...userNoSensitiveData } = obj;
  return userNoSensitiveData;
}