import { describe, expect, it } from 'vitest';

import { prepareNamedResourcesMap } from './prepare-map';

describe('prepareNamedResourcesMap', () => {
  it('creates map keyed by stringified _id', () => {
    const resources = [
      { _id: { toString: () => 'r1' }, type: 'system' as const, name: 'Transfer' },
      { _id: { toString: () => 'r2' }, type: 'user' as const, name: 'Food' },
    ];

    const result = prepareNamedResourcesMap(resources);

    expect(result).toEqual({
      r1: { id: 'r1', type: 'system', name: 'Transfer' },
      r2: { id: 'r2', type: 'user', name: 'Food' },
    });
  });
});

