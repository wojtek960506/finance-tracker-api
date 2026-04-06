import { describe, expect, it, vi } from 'vitest';

vi.mock('@named-resource/db', () => ({
  findNamedResources: vi.fn(),
}));

import * as namedResourceDb from '@named-resource/db';

import { prepareNamedResourcesMap } from './prepare-map';

describe('prepareNamedResourcesMap', () => {
  it('creates map keyed by stringified _id', async () => {
    vi.mocked(namedResourceDb.findNamedResources).mockResolvedValue([
      { _id: { toString: () => 'r1' }, type: 'system', name: 'Transfer' },
      { _id: { toString: () => 'r2' }, type: 'user', name: 'Food' },
    ] as any);

    const result = await prepareNamedResourcesMap('category', 'u1', ['r1', 'r2']);

    expect(namedResourceDb.findNamedResources).toHaveBeenCalledWith('category', 'u1', [
      'r1',
      'r2',
    ]);
    expect(result).toEqual({
      r1: { id: 'r1', type: 'system', name: 'Transfer' },
      r2: { id: 'r2', type: 'user', name: 'Food' },
    });
  });
});
