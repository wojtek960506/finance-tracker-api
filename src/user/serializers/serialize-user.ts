import { IUser } from '@user/model';
import { UserResponseDTO } from '@user/schema';

export const serializeUser = (user: IUser): UserResponseDTO => {
  const {
    passwordHash,
    refreshTokenHash,
    emailVerificationTokenHash,
    emailVerificationExpiresAt,
    _id,
    __v,
    ...rest
  } = user.toObject();
  return {
    ...rest,
    id: _id.toString(),
  };
};
