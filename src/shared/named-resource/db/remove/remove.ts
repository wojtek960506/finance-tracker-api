import { DeleteResult, Model } from 'mongoose';

import { NamedResourceMinimal } from '../types';

export const removeNamedResourceById = async <TResource extends NamedResourceMinimal>(
  model: Model<TResource>,
  id: string,
  notFoundErrorFactory: (id: string) => Error,
): Promise<DeleteResult> => {
  const result = await model.deleteOne({ _id: id });
  if (result.deletedCount === 0) throw notFoundErrorFactory(id);
  return result;
};
