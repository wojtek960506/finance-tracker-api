import { Types } from 'mongoose';

import {
  INVESTMENT_INSTRUMENT_KINDS,
  INVESTMENT_OPERATION_KINDS,
} from './consts';

export type InvestmentInstrumentKind = (typeof INVESTMENT_INSTRUMENT_KINDS)[number];
export type InvestmentOperationKind = (typeof INVESTMENT_OPERATION_KINDS)[number];

export interface InvestmentInstrumentAttributes {
  ownerId: Types.ObjectId;
  name: string;
  nameNormalized: string;
  kind: InvestmentInstrumentKind;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentOperationAttributes {
  ownerId: Types.ObjectId;
  instrumentId: Types.ObjectId;
  transactionId?: Types.ObjectId | null;
  kind: InvestmentOperationKind;
  amount: number;
  currency: string;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

