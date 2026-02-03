import { startSession } from "mongoose";
import { CategoryModel } from "@models/category-model";


const SYSTEM_CATEGORY_NAMES = new Set(["exchange", "myAccount"]);

export const upsertSystemCategories = async () => {
  
  const session = await startSession();
  try {
    await session.withTransaction(async () => {
      for (const c of SYSTEM_CATEGORY_NAMES) {
        const doc = { type: 'system', name: c, nameNormalized: c.toLowerCase() }
        await CategoryModel.updateOne(doc, { $setOnInsert: doc }, { upsert: true });
      }
    });
  } finally { session.endSession(); }
}
