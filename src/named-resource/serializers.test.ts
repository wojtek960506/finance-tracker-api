import { describe, expect, it } from 'vitest';

import { serializeNamedResource } from './serializers';

describe('serializeNamedResource', () => {
  it('serializes id and ownerId while dropping __v', () => {
    const resource = {
      toObject: () => ({
        _id: { toString: () => 'r1' },
        ownerId: { toString: () => 'u1' },
        __v: 7,
        type: 'user',
        name: 'Food',
        nameNormalized: 'food',
      }),
    };

    const result = serializeNamedResource(resource);

    expect(result).toEqual({
      id: 'r1',
      ownerId: 'u1',
      type: 'user',
      name: 'Food',
      nameNormalized: 'food',
    });
  });

  it('keeps ownerId undefined when missing', () => {
    const resource = {
      toObject: () => ({
        _id: { toString: () => 'sys1' },
        __v: 0,
        type: 'system',
        name: 'Transfer',
        nameNormalized: 'transfer',
      }),
    };

    const result = serializeNamedResource(resource);

    expect(result).toEqual({
      id: 'sys1',
      ownerId: undefined,
      type: 'system',
      name: 'Transfer',
      nameNormalized: 'transfer',
    });
  });
});
