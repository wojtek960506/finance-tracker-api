import { model, Schema, Types, Document } from "mongoose";


export type CategoryType = "user" | "system";

export interface CategoryAttributes {
  type: CategoryType,
  name: string,
  nameNormalized: string,
};
export interface ICategory extends CategoryAttributes, Document {
  __v: number,
  _id: Types.ObjectId,
  ownerId: Types.ObjectId,
};

const CategorySchema = new Schema<ICategory>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [
        function(this: ICategory) {
          return this.type === "user";
        },
        "Invalid ownerId for catogory type",
      ],
      validate: {
        validator: function (this: ICategory, value: any) {
          if (this.type === "system") return !value; // must not exist for system categories
          return true;
        },
        message: "Invalid ownerId for catogory type",
      }
    },
    type: { type: String, required: true,  enum: ["user", "system"] },
    name: { type: String, required: true, minLength: 1, maxLength: 30 },
    nameNormalized: { type: String, required: true, minLength: 1, maxLength: 30 },
  },
  { timestamps: true }
);

// unique per user
CategorySchema.index(
  { ownerId: 1, nameNormalized: 1 },
  { unique: true, partialFilterExpression: { type: "user" } },
);

// unique globally for system
CategorySchema.index(
  { nameNormalized: 1 },
  { unique: true, partialFilterExpression: { type: "system" } },
);

export const CategoryModel = model<ICategory>("Category", CategorySchema);
