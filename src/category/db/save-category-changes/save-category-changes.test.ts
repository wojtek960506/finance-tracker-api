import { describe, expect, it, vi } from 'vitest';

import { saveCategoryChanges } from '@category/db';
import * as serializers from '@category/serializers';

import { getUserCategoryResultJSON } from '@/testing/factories/category';

describe('saveCategoryChanges', () => {
  const save = vi.fn();
  const newProps = { name: 'FooD 123', nameNormalized: 'food 123' };
  const iCategory = { ...getUserCategoryResultJSON(), save };
  const updatedCategory = { ...iCategory, name: 'FooD 123', nameNormalized: 'food 123' };

  it('save category changes', async () => {
    vi.spyOn(serializers, 'serializeCategory').mockReturnValue(updatedCategory as any);

    const result = await saveCategoryChanges(iCategory as any, newProps);

    expect(save).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledWith(updatedCategory);
    expect(result).toEqual(updatedCategory);
  });
});
