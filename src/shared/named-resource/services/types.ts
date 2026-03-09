import { Types } from 'mongoose';

export type NamedResourceMinimal = {
  type: 'user' | 'system';
  ownerId?: string | Types.ObjectId;
};

export type NameDTO = { name: string };
