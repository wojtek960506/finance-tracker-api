import { Document, model, Schema, Types } from 'mongoose';

export const USER_EMAIL_VERIFICATION_METHODS = [
  'legacy-backfill',
  'self-verified',
] as const;

export type UserEmailVerificationMethod =
  (typeof USER_EMAIL_VERIFICATION_METHODS)[number];

export interface UserAttributes {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  emailVerifiedAt?: Date | null;
  emailVerificationMethod?: UserEmailVerificationMethod | null;
  emailVerificationTokenHash?: string | null;
  emailVerificationExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  refreshTokenHash?: { tokenHash: string; createdAt: Date };
}

export interface IUser extends UserAttributes, Document {
  _id: Types.ObjectId;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    emailVerifiedAt: { type: Date, default: null },
    emailVerificationMethod: {
      type: String,
      enum: USER_EMAIL_VERIFICATION_METHODS,
      default: null,
    },
    emailVerificationTokenHash: { type: String, default: null, index: true },
    emailVerificationExpiresAt: { type: Date, default: null },
    refreshTokenHash: {
      tokenHash: { type: String, index: true },
      createdAt: { type: Date, default: () => new Date() },
    },
  },
  {
    timestamps: true,
    autoIndex: true,
  },
);

export const UserModel = model<IUser>('User', UserSchema);
