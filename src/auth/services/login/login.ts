import argon2 from 'argon2';

import { LoginDTO } from '@auth/schema';
import {
  type AccessRefreshTokens,
  createAccessToken,
  createRefreshToken,
} from '@auth/services';
import { UserModel } from '@user/model';
import {
  UnauthorizedEmailNotVerifiedError,
  UnauthorizedInvalidCredentialsError,
  UnauthorizedUserNotFoundError,
} from '@utils/errors';

export const login = async (dto: LoginDTO): Promise<AccessRefreshTokens> => {
  const { email, password } = dto;
  const user = await UserModel.findOne({ email });
  if (!user) throw new UnauthorizedUserNotFoundError(email);

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) throw new UnauthorizedInvalidCredentialsError();
  if (!user.emailVerifiedAt) throw new UnauthorizedEmailNotVerifiedError();

  // create access token (include minimal claims)
  const accessToken = createAccessToken({
    userId: user._id.toString(),
    email: user.email,
  });

  // create refresh token and store hashed version
  const { token: refreshToken, tokenHash } = createRefreshToken();

  // append the refresh token hash to the user (rotate strategy)
  user.refreshTokenHash = { tokenHash, createdAt: new Date() };
  await user.save();

  return { accessToken, refreshToken };
};
