import { findUser } from '@user/db';
import { UserResponseDTO } from '@user/schema';
import { serializeUser } from '@user/serializers';
import { AppError } from '@utils/errors';

export const getUser = async (
  userId: string,
  authenticatedUserId: string,
): Promise<UserResponseDTO> => {
  if (userId !== authenticatedUserId) {
    throw new AppError(
      401,
      'Cannot get info about different user.',
      undefined,
      'ACCESS_DENIED_DIFFERENT_USER_INFO',
    );
  }

  return serializeUser(await findUser(userId));
};
