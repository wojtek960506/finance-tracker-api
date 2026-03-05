import { model, Schema, Types, Document } from "mongoose";


export type PaymentMethodType = "user" | "system";

export interface PaymentMethodAttributes {
  type: PaymentMethodType,
  name: string,
  nameNormalized: string,
};
export interface IPaymentMethod extends PaymentMethodAttributes, Document {
  __v: number,
  _id: Types.ObjectId,
  ownerId?: Types.ObjectId,
};

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [
        function(this: IPaymentMethod) {
          return this.type === "user";
        },
        "Invalid ownerId for payment method type",
      ],
      validate: {
        validator: function (this: IPaymentMethod, value: any) {
          if (this.type === "system") return !value; // must not exist for system payment methods
          return true;
        },
        message: "Invalid ownerId for payment method type",
      }
    },
    type: { type: String, required: true,  enum: ["user", "system"] },
    name: { type: String, required: true, minLength: 1, maxLength: 30 },
    nameNormalized: { type: String, required: true, minLength: 1, maxLength: 30 },
  },
  { timestamps: true }
);

// unique per user
PaymentMethodSchema.index(
  { ownerId: 1, nameNormalized: 1 },
  { unique: true, partialFilterExpression: { type: "user" } },
);

// unique globally for system
PaymentMethodSchema.index(
  { nameNormalized: 1 },
  { unique: true, partialFilterExpression: { type: "system" } },
);

export const PaymentMethodModel = model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema);
