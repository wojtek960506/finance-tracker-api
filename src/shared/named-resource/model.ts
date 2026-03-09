import { Document, model, Schema, Types } from 'mongoose';

import { NamedResourceAttributes } from './types';

export interface INamedResource extends NamedResourceAttributes, Document {
  __v: number;
  _id: Types.ObjectId;
  ownerId?: Types.ObjectId;
}

export const createNamedResourceModel = <TDocument extends INamedResource>(
  modelName: string,
  invalidOwnerMessage: string,
) => {
  const schema = new Schema<TDocument>(
    {
      ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [
          function (this: TDocument) {
            return this.type === 'user';
          },
          invalidOwnerMessage,
        ],
        validate: {
          validator: function (this: TDocument, value: unknown) {
            if (this.type === 'system') return !value;
            return true;
          },
          message: invalidOwnerMessage,
        },
      },
      type: { type: String, required: true, enum: ['user', 'system'] },
      name: { type: String, required: true, minLength: 1, maxLength: 30 },
      nameNormalized: { type: String, required: true, minLength: 1, maxLength: 30 },
    },
    { timestamps: true },
  );

  schema.index(
    { ownerId: 1, nameNormalized: 1 },
    { unique: true, partialFilterExpression: { type: 'user' } },
  );

  schema.index(
    { nameNormalized: 1 },
    { unique: true, partialFilterExpression: { type: 'system' } },
  );

  return model<TDocument>(modelName, schema);
};
