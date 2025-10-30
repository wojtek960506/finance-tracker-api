import { Schema, model, Document } from "mongoose";

export interface TransactionAttributes {
  date: Date;
  description: string;
  amount: number;
  currency: string;
  category: string;
  transactionType: "income" | "expense";
  paymentMethod: "cash" | "card" | "blik" | "transfer" | "atm";
  account: string;
  createdAt: Date;
  updatedAt: Date;
  idx?: number;
  exchangeRate?: number;
  currencies?: string;
  calcRefIdx?: number;
}

export interface ITransaction extends TransactionAttributes, Document<string> {}

const transactionSchema = new Schema<ITransaction>(
  {
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 3 },
    category: { type: String, required: true },
    transactionType: { type: String, required: true, enum: ["income", "expense"] },
    paymentMethod: { 
      type: String,
      required: true,
      enum: ["cash", "card", "blik", "transfer", "atm"]
    },
    account: { type: String, required: true },
    idx: { type: Number, required: false },
    exchangeRate: { type: Number, required: false },
    currencies: { type: String, required: false },
    calcRefIdx: { type: Number, required: false },
  },
  { timestamps: true }
);

export const Transaction = model<ITransaction>("Transaction", transactionSchema);