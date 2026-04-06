import { Types } from 'mongoose';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@named-resource-favorite/model', () => ({
  FavoriteNamedResourceModel: {
    deleteOne: vi.fn(),
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

import { FavoriteNamedResourceModel } from '@named-resource-favorite/model';

import {
  findFavoriteNamedResourceIds,
  persistFavoriteNamedResource,
  removeFavoriteNamedResource,
} from './db';

describe('findFavoriteNamedResourceIds', () => {
  it('loads and maps favorite resource ids', async () => {
    const select = vi
      .fn()
      .mockResolvedValue([
        { resourceId: new Types.ObjectId('507f1f77bcf86cd799439011') },
        { resourceId: new Types.ObjectId('507f1f77bcf86cd799439012') },
      ]);
    vi.mocked(FavoriteNamedResourceModel.find).mockReturnValue({ select } as any);

    const result = await findFavoriteNamedResourceIds('u1', 'category');

    expect(FavoriteNamedResourceModel.find).toHaveBeenCalledWith({
      userId: 'u1',
      resourceType: 'category',
    });
    expect(select).toHaveBeenCalledWith({ _id: 0, resourceId: 1 });
    expect(result).toEqual(['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']);
  });
});

describe('persistFavoriteNamedResource', () => {
  it('upserts favorite relation with object ids', async () => {
    const favorite = { id: 'fav1' };
    vi.mocked(FavoriteNamedResourceModel.findOneAndUpdate).mockResolvedValue(
      favorite as any,
    );

    const result = await persistFavoriteNamedResource(
      '507f1f77bcf86cd799439013',
      'paymentMethod',
      '507f1f77bcf86cd799439014',
    );

    expect(FavoriteNamedResourceModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        userId: new Types.ObjectId('507f1f77bcf86cd799439013'),
        resourceType: 'paymentMethod',
        resourceId: new Types.ObjectId('507f1f77bcf86cd799439014'),
      },
      {},
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
    expect(result).toEqual(favorite);
  });
});

describe('removeFavoriteNamedResource', () => {
  it('deletes favorite relation with object ids', async () => {
    const deleteResult = { acknowledged: true, deletedCount: 1 };
    vi.mocked(FavoriteNamedResourceModel.deleteOne).mockResolvedValue(
      deleteResult as any,
    );

    const result = await removeFavoriteNamedResource(
      '507f1f77bcf86cd799439015',
      'account',
      '507f1f77bcf86cd799439016',
    );

    expect(FavoriteNamedResourceModel.deleteOne).toHaveBeenCalledWith({
      userId: new Types.ObjectId('507f1f77bcf86cd799439015'),
      resourceType: 'account',
      resourceId: new Types.ObjectId('507f1f77bcf86cd799439016'),
    });
    expect(result).toEqual(deleteResult);
  });
});
