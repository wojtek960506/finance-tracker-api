import { CounterModel } from "@models/counter-model";

export async function getNextSourceIndex(userId: string) {
  const res = await CounterModel.findOneAndUpdate(
    { _id: { type: "transactions", userId} },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: "after"
    }
  )
  return res.seq;
}