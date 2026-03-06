import { ClientSession } from 'mongoose';

import { CategoryModel } from '@category/model';
import { withSession } from '@utils/with-session';

const SYSTEM_CATEGORY_NAMES = new Set(['exchange', 'myAccount']);

const upsertSystemCategoriesCore = async (session: ClientSession) => {
  for (const c of SYSTEM_CATEGORY_NAMES) {
    const doc = { type: 'system', name: c, nameNormalized: c.toLowerCase() };
    await CategoryModel.updateOne(doc, { $setOnInsert: doc }, { upsert: true, session });
  }
};

export const upsertSystemCategories = async () => withSession(upsertSystemCategoriesCore);
