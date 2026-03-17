import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { authorizeAccessToken } from '@auth/services';
import { ParamsJustId } from '@shared/http';
import {
  TestUserCreateDTO,
  TestUserCreateResponseDTO,
  TestUserCreateResponseSchema,
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
  const ParamsJustIdSchema = z.object({
    id: z.string().describe('User id'),
  });

  app.get<{ Reply: UsersResponseDTO }>(
    '/',
    {
      schema: {
        tags: ['Users'],
        summary: 'List users',
        description: 'Return all users.',
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
        summary: 'Get user by id',
        description: 'Return a single user by id. Requires authentication.',
        params: ParamsJustIdSchema,
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
        summary: 'Create user',
        description: 'Create a new user account.',
        body: UserCreateSchema,
        response: {
          201: UserResponseSchema,
        }
      },
    },
    createUserHandler,
  );

  app.post<{ Body: TestUserCreateDTO; Reply: TestUserCreateResponseDTO }>(
    '/test',
    {
      preHandler: [validateBody(TestUserCreateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Users'],
        summary: 'Create test user',
        description:
          'Create a test user and seed sample transactions. Requires authentication.',
        body: TestUserCreateSchema,
        response: {
          201: TestUserCreateResponseSchema,
        }
      },
    },
    createTestUserHandler,
  );

  app.delete<{ Params: ParamsJustId; Reply: UserResponseDTO }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Users'],
        summary: 'Delete user',
        description: 'Delete a user by id. Requires authentication.',
        params: ParamsJustIdSchema,
        response: {
          200: UserResponseSchema,
        }
      },
    },
    deleteUserHandler,
  );
}
