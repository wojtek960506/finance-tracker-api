import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import {
  LoginDTO,
  LoginSchema,
  ResendVerificationDTO,
  ResendVerificationSchema,
  TokenDTO,
  TokenSchema,
  VerifyEmailDTO,
  VerifyEmailSchema,
} from '@auth/schema';
import { authorizeAccessToken } from '@auth/services';
import { UserResponseDTO, UserResponseSchema } from '@user/schema';
import { validateBody } from '@utils/validation';

import {
  getMeHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  resendVerificationHandler,
  verifyEmailHandler,
} from './handlers';

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginDTO; Reply: TokenDTO }>(
    '/login',
    {
      preHandler: validateBody(LoginSchema),
      schema: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Authenticate user and set refresh token cookie.',
        security: [],
        body: LoginSchema,
        response: {
          200: TokenSchema,
        },
      },
    },
    loginHandler,
  );

  app.post<{ Body: VerifyEmailDTO }>(
    '/verify-email',
    {
      preHandler: validateBody(VerifyEmailSchema),
      schema: {
        tags: ['Auth'],
        summary: 'Verify email',
        description: 'Verify a newly registered user email with a one-time token.',
        security: [],
        body: VerifyEmailSchema,
        response: {
          204: z.undefined(),
        },
      },
    },
    verifyEmailHandler,
  );

  app.post<{ Body: ResendVerificationDTO }>(
    '/resend-verification',
    {
      preHandler: validateBody(ResendVerificationSchema),
      schema: {
        tags: ['Auth'],
        summary: 'Resend verification email',
        description:
          'Send a fresh verification email when the account still needs email confirmation.',
        security: [],
        body: ResendVerificationSchema,
        response: {
          204: z.undefined(),
        },
      },
    },
    resendVerificationHandler,
  );

  app.get<{ Reply: TokenDTO }>(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        description: 'Rotate refresh token cookie and return a new access token.',
        security: [],
        response: {
          200: TokenSchema,
        },
      },
    },
    refreshHandler,
  );

  app.post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Logout',
        description: 'Clear refresh token cookie and invalidate session.',
        response: {
          204: z.undefined(),
        },
      },
    },
    logoutHandler,
  );

  app.get<{ Reply: UserResponseDTO }>(
    '/me',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Auth'],
        summary: 'Get current user',
        description: 'Return the authenticated user profile.',
        response: {
          200: UserResponseSchema,
        },
      },
    },
    getMeHandler,
  );
}
