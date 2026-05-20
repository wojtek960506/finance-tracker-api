import { CounterModel } from '@transaction/model';

export async function getNextSourceIndex(userId: string) {
  const res = await CounterModel.findOneAndUpdate(
    { _id: { type: 'transactions', userId } },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: 'after',
    },
  );
  return res.seq;
}

export async function getNextSourceIndices(userId: string, total: number) {
  if (total < 1) return [];

  const res = await CounterModel.findOneAndUpdate(
    { _id: { type: 'transactions', userId } },
    { $inc: { seq: total } },
    {
      upsert: true,
      returnDocument: 'after',
    },
  );

  const start = res.seq - total + 1;
  return Array.from({ length: total }, (_, index) => start + index);
}
