import { z } from 'zod/v4';

import { OBJECT_ID_REGEX } from '@utils/consts';

import { NAMED_RESOURCE_NAME_MAX_LENGTH } from './consts';

export const NamedResourceSchema = z.object({
  name: z.string().min(1).max(NAMED_RESOURCE_NAME_MAX_LENGTH),
});

export const NamedResourceResponseSchema = NamedResourceSchema.extend({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  ownerId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`')
    .optional(),
  type: z.enum(['user', 'system']),
  nameNormalized: z.string().min(1).max(NAMED_RESOURCE_NAME_MAX_LENGTH),
  isFavorite: z.boolean(),
});

export const NamedResourcesResponseSchema = z.array(NamedResourceResponseSchema);

export type NamedResourceDTO = z.infer<typeof NamedResourceSchema>;
export type NamedResourceResponseDTO = z.infer<typeof NamedResourceResponseSchema>;
export type NamedResourcesResponseDTO = z.infer<typeof NamedResourcesResponseSchema>;

z.globalRegistry.add(NamedResourceSchema, { id: 'NamedResource' });
z.globalRegistry.add(NamedResourceResponseSchema, { id: 'NamedResourceResponse' });
z.globalRegistry.add(NamedResourcesResponseSchema, { id: 'NamedResourcesResponse' });
