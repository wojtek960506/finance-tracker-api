import { UserModel } from "@users/model";
import { UserResponseDTO } from "@users/schema";
import { serializeUser } from "@schemas/serializers";


export const getUsers = async (): Promise<UserResponseDTO[]> => {
  const users = await UserModel.find().sort({ lastName: 1 });
  return users.map(u => serializeUser(u));
}
