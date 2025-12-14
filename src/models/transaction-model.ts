import {
  ACCOUNTS,
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES
} from "@utils/consts";
import { Schema, model, Document, Types } from "mongoose";

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
  // TODO - change it to required while enchancing create logic with realIdx
  // or maybe even delete it while parsing csv and keep only realIdx
  // maybe also rename it to something more meaningful to say that we use it to recreate
  // bounding after exporting data
  idx?: number;
  exchangeRate?: number;
  currencies?: string;
  calcRefIdx?: number;
  realIdx?: number;
  realIdxRef?: number;
}

export interface ITransaction extends TransactionAttributes, Document {
  _id: Types.ObjectId,
  ownerId: Types.ObjectId;
  exchangeRefId: Types.ObjectId;
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
    idx: { type: Number, required: false },
    exchangeRate: { type: Number, required: false },
    currencies: { type: String, required: false },
    calcRefIdx: { type: Number, required: false },
    realIdx: { type: Number, required: false },
    realIdxRef: { type: Number, required: false },
    exchangeRefId: { 
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: false,
      index: true
    },
  },
  { timestamps: true }
);

export const TransactionModel = model<ITransaction>("Transaction", transactionSchema);