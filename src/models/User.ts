import { Document, model, Schema } from "mongoose";

export interface UserAttributes {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends UserAttributes, Document<string> {}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
  }, {
    timestamps: true
  }
);

export const User = model<IUser>("User", userSchema);
