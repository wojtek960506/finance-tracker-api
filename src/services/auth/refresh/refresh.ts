import { UserModel } from "@models/user-model";
import { AccessRefreshTokens } from "@services/auth";
import {
  UnauthorizedInvalidRefreshTokenError,
  UnauthorizedMissingRefreshTokenError,
} from "@utils/errors";
import {
  getTokenHash,
  createAccessToken,
  createRefreshToken,
} from "@services/auth/auth-tokens";


export const refresh = async (refreshToken: string | undefined): Promise<AccessRefreshTokens> => {

  if (!refreshToken) throw new UnauthorizedMissingRefreshTokenError();
        
  const refreshTokenHash = getTokenHash(refreshToken);

  // find user by refresh token hash
  const user = await UserModel.findOne({ 
    "refreshTokenHash.tokenHash": refreshTokenHash
  });
  if (!user) throw new UnauthorizedInvalidRefreshTokenError();

  // Rotate refresh token (security best practice)
  const { token: newRefreshToken, tokenHash: newRefreshTokenHash } = createRefreshToken();

  // remove old hash, add new one
  user.refreshTokenHash = { tokenHash: newRefreshTokenHash, createdAt: new Date() };
  await user.save();

  // issue new access token
  const accessToken = createAccessToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return { accessToken, refreshToken: newRefreshToken };
}
