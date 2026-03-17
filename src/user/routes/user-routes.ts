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
  UserResponseSchema,
  UsersResponseDTO,
  UsersResponseSchema,
} from '@user/schema';
import { validateBody } from '@utils/validation';

import {
  createTestUserHandler,
  createUserHandler,
  deleteUserHandler,
  getUserHandler,
  getUsersHandler,
} from './handlers';

export async function userRoutes(
  app: FastifyInstance  & { withTypeProvider: <_T>() => any },
) {
  app.get<{ Reply: UsersResponseDTO }>(
    '/',
    {
      schema: {
        tags: ['Users'],
        response: {
          200: UsersResponseSchema,
        }
      }
    },
    getUsersHandler
  );

  app.get<{ Params: ParamsJustId; Reply: UserResponseDTO }>(
    '/:id',

    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Users'],
        response: {
          200: UserResponseSchema,
        }
      },
    },
    getUserHandler,
  );

  app.post<{ Body: UserCreateDTO; Reply: UserResponseDTO }>(
    '/',
    {
      preHandler: validateBody(UserCreateSchema),
      schema: {
        tags: ['Users'],
        description: "Create user",
        summary: "Create user",
        response: {
          200: UserCreateSchema,
        }
      },
    },
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
