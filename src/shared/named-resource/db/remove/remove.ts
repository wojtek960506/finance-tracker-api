import { DeleteResult } from 'mongoose';

import {
  getNamedResourceKindConfig,
  NamedResourceKind,
} from '@shared/named-resource/kind-config';

export const removeNamedResourceById = async (
  kind: NamedResourceKind,
  id: string,
): Promise<DeleteResult> => {
  const config = getNamedResourceKindConfig(kind);

  const result = await config.model.deleteOne({ _id: id });
  if (result.deletedCount === 0) throw config.notFoundErrorFactory(id);

  return result;
};
