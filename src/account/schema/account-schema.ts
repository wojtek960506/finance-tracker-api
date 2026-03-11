import z from 'zod';

import { OBJECT_ID_REGEX } from '@utils/consts';

export const AccountSchema = z.object({
  name: z.string().min(1).max(30),
});

export const AccountResponseSchema = AccountSchema.extend({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  ownerId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`')
    .optional(),
  type: z.enum(['user', 'system']),
  nameNormalized: z.string().min(1).max(30),
});

export const AccountsResponseSchema = z.array(AccountResponseSchema);

export type AccountDTO = z.infer<typeof AccountSchema>;
export type AccountResponseDTO = z.infer<typeof AccountResponseSchema>;
export type AccountsResponseDTO = z.infer<typeof AccountsResponseSchema>;
