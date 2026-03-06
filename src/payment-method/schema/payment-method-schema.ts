import z from 'zod';

import { OBJECT_ID_REGEX } from '@utils/consts';

export const PaymentMethodSchema = z.object({
  name: z.string().min(1).max(30),
});

export const PaymentMethodResponseSchema = PaymentMethodSchema.extend({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  ownerId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`')
    .optional(),
  type: z.enum(['user', 'system']),
  nameNormalized: z.string().min(1).max(30),
});

export const PaymentMethodsResponseSchema = z.array(PaymentMethodResponseSchema);

export type PaymentMethodDTO = z.infer<typeof PaymentMethodSchema>;
export type PaymentMethodResponseDTO = z.infer<typeof PaymentMethodResponseSchema>;
export type PaymentMethodsResponseDTO = z.infer<typeof PaymentMethodsResponseSchema>;
