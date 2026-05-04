import { z } from 'zod/v4';

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(3),
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const ResendVerificationSchema = z.object({
  email: z.email(),
});

export const TokenSchema = z.object({
  accessToken: z.string(),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
export type ResendVerificationDTO = z.infer<typeof ResendVerificationSchema>;
export type VerifyEmailDTO = z.infer<typeof VerifyEmailSchema>;
export type TokenDTO = z.infer<typeof TokenSchema>;

z.globalRegistry.add(LoginSchema, { id: 'Login' });
z.globalRegistry.add(ResendVerificationSchema, { id: 'ResendVerification' });
z.globalRegistry.add(VerifyEmailSchema, { id: 'VerifyEmail' });
z.globalRegistry.add(TokenSchema, { id: 'AccessToken' });
