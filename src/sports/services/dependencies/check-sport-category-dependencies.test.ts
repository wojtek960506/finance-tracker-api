import mongoose, { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SportCategoryDependencyError } from '@utils/errors';

import { checkSportCategoryDependencies } from './check-sport-category-dependencies';

describe('checkSportCategoryDependencies', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when no sport entries reference categoryId', async () => {
    const categoryId = new Types.ObjectId().toString();
    const countDocumentsMock = vi.fn().mockResolvedValue(0);

    vi.spyOn(mongoose.connection, 'collection').mockReturnValue({
      countDocuments: countDocumentsMock,
    } as any);

    await expect(checkSportCategoryDependencies(categoryId)).resolves.toBeUndefined();
    expect(countDocumentsMock).toHaveBeenCalledWith({
      categoryId: new Types.ObjectId(categoryId),
    });
  });

  it('throws SportCategoryDependencyError when sport entries reference categoryId', async () => {
    const categoryId = new Types.ObjectId().toString();
    const countDocumentsMock = vi.fn().mockResolvedValue(3);

    vi.spyOn(mongoose.connection, 'collection').mockReturnValue({
      countDocuments: countDocumentsMock,
    } as any);

    await expect(checkSportCategoryDependencies(categoryId)).rejects.toBeInstanceOf(
      SportCategoryDependencyError,
    );
  });
});
