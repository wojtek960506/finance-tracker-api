import { Document, model, Schema, Types } from 'mongoose';

import {
  InvestmentInstrumentAttributes,
  InvestmentOperationAttributes,
} from '../types';

export interface IInvestmentInstrument
  extends InvestmentInstrumentAttributes,
    Document {
  __v: number;
  _id: Types.ObjectId;
}

export interface IInvestmentOperation
  extends InvestmentOperationAttributes,
    Document {
  __v: number;
  _id: Types.ObjectId;
}

const investmentInstrumentSchema = new Schema<IInvestmentInstrument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, minLength: 1, maxLength: 60 },
    nameNormalized: { type: String, required: true, minLength: 1, maxLength: 60 },
    kind: {
      type: String,
      required: true,
      enum: ['share', 'fund', 'termDeposit', 'savings'],
    },
    currency: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 3 },
    notes: { type: String, required: false, maxlength: 500 },
  },
  { timestamps: true },
);

investmentInstrumentSchema.index(
  { ownerId: 1, nameNormalized: 1 },
  { unique: true },
);

const investmentOperationSchema = new Schema<IInvestmentOperation>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    instrumentId: {
      type: Schema.Types.ObjectId,
      ref: 'InvestmentInstrument',
      required: true,
      index: true,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      required: function (this: IInvestmentOperation) {
        return this.kind !== 'snapshot';
      },
      default: null,
      index: true,
    },
    kind: {
      type: String,
      required: true,
      enum: ['buy', 'sell', 'interest', 'fee', 'snapshot'],
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 3 },
    date: { type: Date, required: true },
    note: { type: String, required: false, maxlength: 500 },
  },
  { timestamps: true },
);

investmentOperationSchema.index({ ownerId: 1, instrumentId: 1, date: -1 });

investmentOperationSchema.path('transactionId').validate({
  validator: function (this: IInvestmentOperation, value: Types.ObjectId | null) {
    if (this.kind === 'snapshot') return value == null;
    return value != null;
  },
  message: 'Transaction is required for non-snapshot investment operations',
});

export const InvestmentInstrumentModel = model<IInvestmentInstrument>(
  'InvestmentInstrument',
  investmentInstrumentSchema,
);

export const InvestmentOperationModel = model<IInvestmentOperation>(
  'InvestmentOperation',
  investmentOperationSchema,
);
