import { model, Schema, Types } from "mongoose";

export interface ICounter {
  _id: {
    type: string,
    userId: string,
  },
  seq: number,
}

const counterIdSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["transactions"],
    },
    userId: {
      type: Types.ObjectId,
      required: true,
    },
  },
  { _id: false }
)

const counterSchema = new Schema<ICounter>({
  _id: {
    type: counterIdSchema,
    required: true,
  },
  seq: {
    type: Number,
    required: true,
  },
});

export const CounterModel = model<ICounter>("Counter", counterSchema);