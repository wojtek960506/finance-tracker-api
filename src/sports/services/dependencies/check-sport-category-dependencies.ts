import { SportEntryModel } from '@sports/model';
import { Types } from 'mongoose';

import { SportCategoryDependencyError } from '@utils/errors';

export const checkSportCategoryDependencies = async (categoryId: string) => {
  const count = await SportEntryModel.countDocuments({
    categoryId: new Types.ObjectId(categoryId),
  });

  if (count > 0) {
    throw new SportCategoryDependencyError(categoryId);
  }
};
