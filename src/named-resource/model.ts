import { Document, Model, model, Schema, Types } from 'mongoose';

import { NamedResourceAttributes, NamedResourceKind } from './types';

export interface INamedResource extends NamedResourceAttributes, Document {
  __v: number;
  _id: Types.ObjectId;
  ownerId?: Types.ObjectId;
}

export const createNamedResourceModel = <TDocument extends INamedResource>(
  modelName: string,
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
          'Invalid ownerId',
        ],
        validate: {
          validator: function (this: TDocument, value: unknown) {
            if (this.type === 'system') return !value;
            return true;
          },
          message: 'Invalid ownerId',
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

const namedResourceModels: Record<NamedResourceKind, Model<INamedResource>> = {
  account: createNamedResourceModel<INamedResource>('Account'),
  category: createNamedResourceModel<INamedResource>('Category'),
  paymentMethod: createNamedResourceModel<INamedResource>('PaymentMethod'),
};

export const getNamedResourceModel = (kind: NamedResourceKind) => {
  return namedResourceModels[kind];
};
