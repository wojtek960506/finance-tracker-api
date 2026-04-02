import argon2 from 'argon2';
import { ClientSession } from 'mongoose';

import { UserModel } from '@user/model';
import { UserCreateDTO, UserResponseDTO } from '@user/schema';
import { serializeUser } from '@user/serializers';
import { AppError } from '@utils/errors';

export const createUser = async (
  dto: UserCreateDTO,
  session?: ClientSession,
): Promise<UserResponseDTO> => {
  const { password, ...rest } = dto;
  const passwordHash = await argon2.hash(password);

  try {
    const [newUser] = await UserModel.create([{ ...rest, passwordHash: passwordHash }], {
      session,
    });
    return serializeUser(newUser);
  } catch (err) {
    if ((err as { code: number }).code === 11000)
      throw new AppError(
        409,
        'User with given email already exists',
        undefined,
        'USER_EMAIL_ALREADY_EXISTS',
      );
    else
      throw new AppError(
        400,
        (err as { message: string }).message,
        undefined,
        'USER_CREATE_ERROR',
      );
  }
};
