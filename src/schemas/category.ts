import z from "zod";


export const CategorySchema = z.object({
  name: z.string().min(1).max(30),
});

export const CategoryResponseSchema = CategorySchema.extend({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format for `id`"),
  ownerId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format for `ownerId`")
    .optional(),
  type: z.enum(["user", "system"]),
  nameNormalized: z.string().min(1).max(30),
});

export const CategoriesResponseSchema = z.array(CategoryResponseSchema);

export type CategoryDTO = z.infer<typeof CategorySchema>;
export type CategoryResponseDTO = z.infer<typeof CategoryResponseSchema>;
export type CategoriesResponseDTO = z.infer<typeof CategoriesResponseSchema>;
