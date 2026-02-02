import { model, Schema, Types, Document } from "mongoose";


export interface CategoryAttributes {
  type: "user" | "system",
  name: string,
  nameNormalized: string,
};
export interface ICategory extends CategoryAttributes, Document {
  _id: Types.ObjectId,
  ownerId: Types.ObjectId,
};

const CategorySchema = new Schema<ICategory>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
    type: { type: String, required: true,  enum: ["user", "system"] },
    name: { type: String, required: true, minLength: 1, maxLength: 30, unique: true },
    nameNormalized: { type: String, required: true, minLength: 1, maxLength: 30, unique: true },
  },
  { timestamps: true }
);

export const CategoryModel = model<ICategory>("Category", CategorySchema);
