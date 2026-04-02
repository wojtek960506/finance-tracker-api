import { normalizeWhitespace } from '@utils/strings';

import { NamedResourceMinimal, NameDTO } from '../types';

export const createNamedResource = <TDTO extends NameDTO, TResponse>(deps: {
  findByName: (name: string, ownerId: string) => Promise<NamedResourceMinimal | null>;
  persist: (props: {
    ownerId: string;
    type: 'user' | 'system';
    name: string;
    nameNormalized: string;
  }) => Promise<TResponse>;
  alreadyExistsErrorFactory: (name: string) => Error;
  systemNameConflictErrorFactory: (name: string) => Error;
}) => {
  return async (ownerId: string, dto: TDTO): Promise<TResponse> => {
    const { name } = dto;

    const resource = await deps.findByName(name, ownerId);
    if (resource) {
      if (resource.type === 'system') throw deps.systemNameConflictErrorFactory(name);
      throw deps.alreadyExistsErrorFactory(name);
    }

    const normalizedName = normalizeWhitespace(name);
    return deps.persist({
      ownerId,
      type: 'user',
      name: normalizedName,
      nameNormalized: normalizedName.toLowerCase(),
    });
  };
};
