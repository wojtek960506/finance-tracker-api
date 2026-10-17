import mongoose, { Types } from 'mongoose';

import { SportCategoryDependencyError } from '@utils/errors';

export const checkSportCategoryDependencies = async (categoryId: string) => {
  const model = mongoose.models['SportEntry'];
  const count = model
    ? await model.countDocuments({ categoryId: new Types.ObjectId(categoryId) })
    : await mongoose.connection
        .collection('sportentries')
        .countDocuments({ categoryId: new Types.ObjectId(categoryId) });

  if (count > 0) {
    throw new SportCategoryDependencyError(categoryId);
  }
};
