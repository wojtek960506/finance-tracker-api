import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { CategoryModel } from '@category/model';
import { serializeCategory } from '@category/serializers';
import * as namedResource from '@shared/named-resource';
import { CategoryNotFoundError } from '@utils/errors';

import {
  findCategories,
  findCategoryById,
  findCategoryByName,
  persistCategory,
  saveCategoryChanges,
} from './category.db';

vi.mock('@category/model', () => ({
  CategoryModel: {},
}));

vi.mock('@category/serializers', () => ({
  serializeCategory: vi.fn(),
}));

vi.mock('@shared/named-resource', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/named-resource')>();
  return {
    ...actual,
    findNamedResourceById: vi.fn(),
    findNamedResourceByName: vi.fn(),
    findNamedResources: vi.fn(),
    persistNamedResource: vi.fn(),
    saveNamedResourceChanges: vi.fn(),
  };
});

describe('category db wiring', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // prettier-ignore
  it(
    'findCategoryById delegates to findNamedResourceById with category not-found factory',
    async () => {
      const resultObj = { id: '1' };
      (namedResource.findNamedResourceById as Mock).mockResolvedValue(resultObj);

      const result = await findCategoryById('cat-1');

      expect(namedResource.findNamedResourceById).toHaveBeenCalledOnce();
      const [modelArg, idArg, factoryArg] = (namedResource.findNamedResourceById as Mock)
        .mock.calls[0];
      expect(modelArg).toBe(CategoryModel);
      expect(idArg).toBe('cat-1');
      expect(factoryArg('x')).toBeInstanceOf(CategoryNotFoundError);
      expect(result).toBe(resultObj);
    }
  );

  it('findCategoryByName delegates to findNamedResourceByName', async () => {
    const resultObj = { id: '1' };
    (namedResource.findNamedResourceByName as Mock).mockResolvedValue(resultObj);

    const result = await findCategoryByName('Food', 'u1');

    expect(namedResource.findNamedResourceByName).toHaveBeenCalledWith(
      CategoryModel,
      'Food',
      'u1',
    );
    expect(result).toBe(resultObj);
  });

  it('findCategories delegates to findNamedResources', async () => {
    const resultObj = [{ id: '1' }];
    (namedResource.findNamedResources as Mock).mockResolvedValue(resultObj);

    const result = await findCategories('u1', ['c1']);

    expect(namedResource.findNamedResources).toHaveBeenCalledWith(CategoryModel, 'u1', [
      'c1',
    ]);
    expect(result).toBe(resultObj);
  });

  it('persistCategory delegates to persistNamedResource with serializer', async () => {
    const props = {
      ownerId: 'u1',
      type: 'user' as const,
      name: 'Food',
      nameNormalized: 'food',
    };
    const resultObj = { id: '1' };
    (namedResource.persistNamedResource as Mock).mockResolvedValue(resultObj);

    const result = await persistCategory(props);

    expect(namedResource.persistNamedResource).toHaveBeenCalledWith(
      CategoryModel,
      props,
      serializeCategory,
    );
    expect(result).toBe(resultObj);
  });

  it('saveCategoryChanges delegates to saveNamedResourceChanges with serializer', async () => {
    const category = { _id: '1' } as any;
    const props = { name: 'New', nameNormalized: 'new' };
    const resultObj = { id: '1', name: 'New' };
    (namedResource.saveNamedResourceChanges as Mock).mockResolvedValue(resultObj);

    const result = await saveCategoryChanges(category, props);

    expect(namedResource.saveNamedResourceChanges).toHaveBeenCalledWith(
      category,
      props,
      serializeCategory,
    );
    expect(result).toBe(resultObj);
  });
});
