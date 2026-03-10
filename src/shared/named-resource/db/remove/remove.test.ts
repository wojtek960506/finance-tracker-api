import { describe, expect, it, vi } from 'vitest';

import { removeNamedResourceById } from './remove';

describe('removeNamedResourceById', () => {
  it('returns result when delete removes a document', async () => {
    const resultObj = { deletedCount: 1 };
    const model = { deleteOne: vi.fn().mockResolvedValue(resultObj) } as any;

    const result = await removeNamedResourceById(model, 'abc', (id) => new Error(id));

    expect(model.deleteOne).toHaveBeenCalledWith({ _id: 'abc' });
    expect(result).toBe(resultObj);
  });

  it('throws not-found error when delete removes nothing', async () => {
    const model = { deleteOne: vi.fn().mockResolvedValue({ deletedCount: 0 }) } as any;

    await expect(
      removeNamedResourceById(model, 'missing', (id) => new Error(`nf:${id}`)),
    ).rejects.toThrow('nf:missing');
  });
});
