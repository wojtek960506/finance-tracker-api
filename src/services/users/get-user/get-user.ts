import { findUser } from "@db/users";
import { AppError } from "@utils/errors";
import { UserResponseDTO } from "@schemas/user";
import { serializeUser } from "@schemas/serializers";


export const getUser = async (
  userId: string,
  authenticatedUserId: string,
): Promise<UserResponseDTO> => {
  if (userId !== authenticatedUserId) {
    throw new AppError(401, "Cannot get info about different user.")
  }

  return serializeUser(await findUser(userId));
}
