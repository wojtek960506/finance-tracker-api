import { UserModel } from "@models/user-model";
import { UserResponseDTO } from "@schemas/user";
import { serializeUser } from "@schemas/serializers";


export const getUsers = async (): Promise<UserResponseDTO[]> => {
  const users = await UserModel.find().sort({ lastName: 1 });
  return users.map(u => serializeUser(u));
}
