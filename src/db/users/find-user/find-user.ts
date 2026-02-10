import { UserModel } from "@models/user-model";
import { UserNotFoundError } from "@utils/errors/user-errors";


export const findUser = async (id: string) => {
  const user = await UserModel.findById(id);
  if (!user) throw new UserNotFoundError(id);
  return user;
}
