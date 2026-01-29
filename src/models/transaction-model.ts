import { Schema, model, Document, Types } from "mongoose";
import {
  ACCOUNTS,
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES
} from "@utils/consts";


export interface TransactionAttributes {
  date: Date;
  description: string;
  amount: number;
  currency: string;
  category: string;
  transactionType: "income" | "expense";
  paymentMethod: string;
  account: string;
  createdAt: Date;
  updatedAt: Date;
  exchangeRate?: number;
  currencies?: string;
  sourceIndex: number;
  sourceRefIndex?: number;
}

export interface ITransaction extends TransactionAttributes, Document {
  _id: Types.ObjectId,
  ownerId: Types.ObjectId;
  refId: Types.ObjectId;
}

const transactionSchema = new Schema<ITransaction>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { 
      type: String,
      required: true,
      uppercase: true, 
      minlength: 3,
      maxlength: 3,
      enums: [...CURRENCIES]
    },
    category: { type: String, required: true, enum: [...CATEGORIES] },
    transactionType: { type: String, required: true, enum: [...TRANSACTION_TYPES] },
    paymentMethod: { type: String, required: true, enum: [...PAYMENT_METHODS] },
    account: { type: String, required: true, enum: [...ACCOUNTS] },
    exchangeRate: { type: Number, required: false },
    currencies: { type: String, required: false },
    sourceIndex: { type: Number, required: true },
    sourceRefIndex: { type: Number, required: false },
    refId: { 
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: false,
      index: true
    },
  },
  { timestamps: true }
);

export const TransactionModel = model<ITransaction>("Transaction", transactionSchema);