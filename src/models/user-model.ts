import { Document, model, Schema, Types } from "mongoose";

export interface UserAttributes {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  refreshTokenHash?: { tokenHash: string, createdAt: Date };
}

export interface IUser extends UserAttributes, Document {
  _id: Types.ObjectId
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    refreshTokenHash: {
      tokenHash: { type: String, index: true },
      createdAt: { type: Date, default: () => new Date() }
    }
  }, {
    timestamps: true,
    autoIndex: true,
  }
);

export const UserModel = model<IUser>("User", UserSchema);
