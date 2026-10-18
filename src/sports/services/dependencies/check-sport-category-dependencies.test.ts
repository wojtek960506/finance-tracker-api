import { SportEntryModel } from '@sports/model';
import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SportCategoryDependencyError } from '@utils/errors';

import { checkSportCategoryDependencies } from './check-sport-category-dependencies';

describe('checkSportCategoryDependencies', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when no sport entries reference categoryId', async () => {
    const categoryId = new Types.ObjectId().toString();
    const countDocumentsSpy = vi
      .spyOn(SportEntryModel, 'countDocuments')
      .mockResolvedValue(0 as any);

    await expect(checkSportCategoryDependencies(categoryId)).resolves.toBeUndefined();
    expect(countDocumentsSpy).toHaveBeenCalledWith({
      categoryId: new Types.ObjectId(categoryId),
    });
  });

  it('throws SportCategoryDependencyError when sport entries reference categoryId', async () => {
    const categoryId = new Types.ObjectId().toString();
    vi.spyOn(SportEntryModel, 'countDocuments').mockResolvedValue(3 as any);

    await expect(checkSportCategoryDependencies(categoryId)).rejects.toBeInstanceOf(
      SportCategoryDependencyError,
    );
  });
});
