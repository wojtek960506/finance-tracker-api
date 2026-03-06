import { FastifyInstance } from 'fastify';

import { authorizeAccessToken } from '@auth/services';
import { ParamsJustId } from '@shared/http';
import {
  TestUserCreateDTO,
  TestUserCreateResponseDTO,
  TestUserCreateSchema,
  UserCreateDTO,
  UserCreateSchema,
  UserResponseDTO,
  UsersResponseDTO,
} from '@user/schema';
import { validateBody } from '@utils/validation';

import {
  createTestUserHandler,
  createUserHandler,
  deleteUserHandler,
  getUserHandler,
  getUsersHandler,
} from './handlers';

export async function userRoutes(app: FastifyInstance) {
  app.get<{ Reply: UsersResponseDTO }>('/', getUsersHandler);

  app.get<{ Params: ParamsJustId; Reply: UserResponseDTO }>(
    '/:id',
    { preHandler: authorizeAccessToken() },
    getUserHandler,
  );

  app.post<{ Body: UserCreateDTO; Reply: UserResponseDTO }>(
    '/',
    { preHandler: validateBody(UserCreateSchema) },
    createUserHandler,
  );

  app.post<{ Body: TestUserCreateDTO; Reply: TestUserCreateResponseDTO }>(
    '/test',
    { preHandler: [validateBody(TestUserCreateSchema), authorizeAccessToken()] },
    createTestUserHandler,
  );

  app.delete<{ Params: ParamsJustId; Reply: UserResponseDTO }>(
    '/:id',
    { preHandler: authorizeAccessToken() },
    deleteUserHandler,
  );
}
