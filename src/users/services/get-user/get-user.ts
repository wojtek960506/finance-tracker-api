import { findUser } from "@users/db";
import { AppError } from "@utils/errors";
import { UserResponseDTO } from "@users/schema";
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
