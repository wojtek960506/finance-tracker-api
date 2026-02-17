import argon2 from "argon2";
import { LoginDTO } from "@schemas/auth";
import { UserModel } from "@models/user-model";
import { createAccessToken, createRefreshToken } from "@services/auth";
import { 
  UnauthorizedUserNotFoundError,
  UnauthorizedInvalidCredentialsError,
} from "@utils/errors";


type LoginResult = { accessToken: string, refreshToken: string };

export const login = async (dto: LoginDTO): Promise<LoginResult> => {
  const { email, password } = dto;
  const user = await UserModel.findOne({ email });
  if (!user) throw new UnauthorizedUserNotFoundError(email);

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) throw new UnauthorizedInvalidCredentialsError();

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
}
