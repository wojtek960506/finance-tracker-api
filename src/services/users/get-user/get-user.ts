import { UserModel } from "@models/user-model";
import { UserResponseDTO } from "@schemas/user";
import { serializeUser } from "@schemas/serializers";
import { AppError, NotFoundError } from "@utils/errors";


export const getUser = async (
  userId: string,
  authenticatedUserId: string,
): Promise<UserResponseDTO> => {
  if (userId !== authenticatedUserId) {
    throw new AppError(401, "Cannot get info about different user.")
  }

  const user = await UserModel.findById(userId);
  if (!user)
    throw new NotFoundError(`User with ID '${userId}' not found`);

  return serializeUser(user);
}