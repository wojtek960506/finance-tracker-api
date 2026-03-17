import { z } from 'zod/v4';

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(3),
});

export const TokenSchema = z.object({
  accessToken: z.string(),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
export type TokenDTO = z.infer<typeof TokenSchema>;

z.globalRegistry.add(LoginSchema, { id: 'Login' });
z.globalRegistry.add(TokenSchema, { id: 'AccessToken' });
