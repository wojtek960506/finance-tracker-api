import z from "zod";

const UserCommonSchema = z.object({
  firstName: z.string().min(3, "First name must have at least 3 characters."),
  lastName: z.string().min(3, "Last name must have at least 3 characters."),
  email: z.email(),
})

/**
 * Create User Schema
 * used for POST /users
 */
export const UserCreateSchema = UserCommonSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
})


/**
 * Full Update Schema (PUT)
 * Requires all fields (same as create)
 */
export const UserUpdateSchema = UserCreateSchema;

/**
 * Partial Update Schema (PATCH)
 * All fields optional
 */
export const UserPatchSchema = UserCreateSchema.partial();

export const UserResponseSchema = UserCommonSchema.extend({
  _id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  __v: z.number(),
});

export const UsersResponseSchema = z.array(UserResponseSchema);

export type UserCreateDTO = z.infer<typeof UserCreateSchema>;
export type UserUpdateDTO = z.infer<typeof UserUpdateSchema>;
export type UserPatchDTO = z.infer<typeof UserPatchSchema>;
export type UserResponseDTO = z.infer<typeof UserResponseSchema>;
export type UsersResponseDTO = z.infer<typeof UsersResponseSchema>;

export type UserSensitiveResponseDTO = UserResponseDTO & {
  passwordHash: string;
  refreshTokenHashes?: { tokenHash: string, createdAt: Date }[];
}
