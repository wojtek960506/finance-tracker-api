import { FilterQuery } from 'mongoose';

import { ITransaction, TransactionModel } from '@transaction/model';

export const streamTransactions = (filter: FilterQuery<ITransaction>) =>
  TransactionModel.find(filter).sort({ sourceIndex: 1 }).cursor();
