import { Document, model, Schema, Types } from "mongoose";

export interface UserAttributes {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  // store hashed refresh tokens to allow multiple devices/sessions
  refreshTokenHashes?: { tokenHash: string, createdAt: Date }[];
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
    refreshTokenHashes: [{
      tokenHash: { type: String },
      createdAt: { type: Date, default: () => new Date() }
    }]
  }, {
    timestamps: true,
    autoIndex: true,
  }
);

export const UserModel = model<IUser>("User", UserSchema);
