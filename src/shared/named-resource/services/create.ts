import { normalizeWhitespace } from '@utils/strings';

import { NameDTO } from './types';

console.log('cde')

export const createNamedResource = <TDTO extends NameDTO, TResponse>(deps: {
  findByName: (name: string, ownerId: string) => Promise<unknown>;
  persist: (props: {
    ownerId: string;
    type: 'user' | 'system';
    name: string;
    nameNormalized: string;
  }) => Promise<TResponse>;
  alreadyExistsErrorFactory: (name: string) => Error;
}) => {
  return async (ownerId: string, dto: TDTO): Promise<TResponse> => {
    const { name } = dto;

    const resource = await deps.findByName(name, ownerId);
    if (resource) throw deps.alreadyExistsErrorFactory(name);

    const normalizedName = normalizeWhitespace(name);
    return deps.persist({
      ownerId,
      type: 'user',
      name: normalizedName,
      nameNormalized: normalizedName.toLowerCase(),
    });
  };
};
