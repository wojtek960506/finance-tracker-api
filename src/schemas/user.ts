import z from "zod";

const UserCommonSchema = z.object({
  firstName: z.string().min(2, "First name must have at least 2 characters."),
  lastName: z.string().min(2, "Last name must have at least 2 characters."),
  email: z.email(),
})

/**
 * Create User Schema
 * used for POST /users
 */
export const UserCreateSchema = UserCommonSchema.extend({
  password: z.string().min(3, "Password must be at least 3 characters"),
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
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const UserSensitiveResponseSchema = UserResponseSchema.extend({
  passwordHash: z.string(),
  refreshTokenHashes: z.array(
    z.object({
      tokenHash: z.string(),
      createdAt: z.coerce.date(),
    })
  ).optional(),
})

export const UsersResponseSchema = z.array(UserResponseSchema);

export const TestUserCreateSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9_]+$/, {
    message: "Only letters, digits and _ (uderscore) are allowed",
  }),
  totalTransactions: z.number().min(1000).max(20000),
});

export const TestUserCreateResponseSchema = z.object({
  userId: z.string(),
  email: z.email(),
  insertedTransactionsCount: z.number(),
});

export type UserCreateDTO = z.infer<typeof UserCreateSchema>;
export type UserUpdateDTO = z.infer<typeof UserUpdateSchema>;
export type UserPatchDTO = z.infer<typeof UserPatchSchema>;
export type UserResponseDTO = z.infer<typeof UserResponseSchema>;
export type UsersResponseDTO = z.infer<typeof UsersResponseSchema>;
export type UserSensitiveResponseDTO = z.infer<typeof UserSensitiveResponseSchema>;
export type TestUserCreateDTO = z.infer<typeof TestUserCreateSchema>;
export type TestUserCreateResponseDTO = z.infer<typeof TestUserCreateResponseSchema>;
