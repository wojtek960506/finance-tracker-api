import { Types } from 'mongoose';

export type NamedResourceMinimal = {
  type: 'user' | 'system';
  ownerId?: string | Types.ObjectId;
  _id?: { toString: () => string };
};

export type NameDTO = { name: string };
