import { ClientSession } from 'mongoose';

import { CounterModel } from '@transaction/model';

export async function getNextSourceIndex(userId: string, session?: ClientSession) {
  const res = await CounterModel.findOneAndUpdate(
    { _id: { type: 'transactions', userId } },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: 'after',
      session,
    },
  );
  return res.seq;
}

export async function getNextSourceIndices(
  userId: string,
  total: number,
  session?: ClientSession,
) {
  if (total < 1) return [];

  const res = await CounterModel.findOneAndUpdate(
    { _id: { type: 'transactions', userId } },
    { $inc: { seq: total } },
    {
      upsert: true,
      returnDocument: 'after',
      session,
    },
  );

  const start = res.seq - total + 1;
  return Array.from({ length: total }, (_, index) => start + index);
}
