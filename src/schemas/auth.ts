import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

export const TokenSchema = z.object({
  accessToken: z.string()
});