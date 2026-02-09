import argon2 from "argon2";
import { AppError } from "@utils/errors";
import { ClientSession } from "mongoose";
import { UserModel } from "@models/user-model";
import { serializeUser } from "@schemas/serializers";
import { UserCreateDTO, UserResponseDTO } from "@schemas/user";


export const createUser = async (
  dto: UserCreateDTO,
  session?: ClientSession,
): Promise<UserResponseDTO> => {
  const { password, ...rest } = dto;
  const passwordHash1 = await argon2.hash(password);
  
  try {
    const [ newUser ] = await UserModel.create(
      [{ ...rest, passwordHash: passwordHash1 }],
      { session });
    return serializeUser(newUser);
  } catch (err) {
    if ((err as { code: number }).code === 11000)
      throw new AppError(409, "User with given email already exists");
    else
      throw new AppError(400, (err as { message: string }).message);
  }
}
