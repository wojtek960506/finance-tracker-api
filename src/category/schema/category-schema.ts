import z from "zod";
import { OBJECT_ID_REGEX } from "@utils/consts";


export const CategorySchema = z.object({
  name: z.string().min(1).max(30),
});

export const CategoryResponseSchema = CategorySchema.extend({
  id: z.string().regex(OBJECT_ID_REGEX, "Invalid ObjectId format for `id`"),
  ownerId: z
    .string()
    .regex(OBJECT_ID_REGEX, "Invalid ObjectId format for `ownerId`")
    .optional(),
  type: z.enum(["user", "system"]),
  nameNormalized: z.string().min(1).max(30),
});

export const CategoriesResponseSchema = z.array(CategoryResponseSchema);

export type CategoryDTO = z.infer<typeof CategorySchema>;
export type CategoryResponseDTO = z.infer<typeof CategoryResponseSchema>;
export type CategoriesResponseDTO = z.infer<typeof CategoriesResponseSchema>;
