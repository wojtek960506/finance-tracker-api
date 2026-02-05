import { ClientSession } from "mongoose";
import { AppError } from "@utils/errors";
import { RandomTransaction } from "./types";
import { findCategoryByName } from "@db/categories";
import { createCategory } from "@services/categories";
import { randomDate, randomFromSet } from "@utils/random";
import { TransactionModel } from "@models/transaction-model";
import {
  prepareRandomStandardTransaction,
  prepareRandomExchangeTransactionPair,
  prepareRandomTransferTransactionPair,
} from "./prepare-random-transaction";


const createOrGetCategory = async (ownerId: string, name: string) => {
  try {
    return await createCategory(ownerId, { name });
  } catch {
    try {
      return await findCategoryByName(name)
    } catch {}
  } 
}

export async function createRandomTransactions(
  ownerId: string,
  totalTransactions: number,
  session?: ClientSession,
): Promise<number> {

  const startDate = new Date("2015-01-01");
  const endDate = new Date("2025-12-31");

  // create some categories
  const testCategoryNames = [
    "Food",
    "Sport",
    "Transport",
    "Accomodation",
    "Entertainment",
    "exchange",   // system category
    "myAccount",  // system category
  ];
  const categories = (await Promise.all(
    testCategoryNames.map(name => createOrGetCategory(ownerId, name))
  )).filter(c => c != undefined);
  const categoryIds = categories.map(c => c.id);
  const categoryNamesMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  const randomTransactions: RandomTransaction[] = [];
  for (let i = 0; i < totalTransactions;) {
    const date = randomDate(startDate, endDate);
  
    const categoryId = randomFromSet(new Set(categoryIds));

    if (categoryNamesMap[categoryId] === "myAccount") {
      const [expense, income] = prepareRandomTransferTransactionPair(
        ownerId, date, i, categoryId
      );
      randomTransactions.push(expense, income);
      i += 2;
    } else if (categoryNamesMap[categoryId] === "exchange") {
      const [expense, income] = prepareRandomExchangeTransactionPair(
        ownerId, date, i, categoryId
      );
      randomTransactions.push(expense, income);
      i += 2;
    } else {
      const transaction = prepareRandomStandardTransaction(ownerId, date, i, categoryId);
      randomTransactions.push(transaction);
      i += 1;
    }
  }

  const result = await TransactionModel.insertMany(
    randomTransactions,
    { rawResult: true, session }
  );

  const insertedIds = Object.values(result.insertedIds);
  const sourceIndices = randomTransactions.map(t => t.sourceIndex);
  if (insertedIds.length !== sourceIndices.length)
    throw new AppError(409, "Not all provided transactions were inserted");
  
  const sourceIndicesToIdsMap = Object.fromEntries(
    sourceIndices.map((idx, i) => [idx, insertedIds[i]])
  );

  // get pairs of id and sourceRefIndex for transacitons which have some reference
  const idRefIdObjArray = randomTransactions
    .filter(t => t.sourceRefIndex !== undefined)
    .map(t => ({
      id: sourceIndicesToIdsMap[t.sourceIndex],
      refId: sourceIndicesToIdsMap[t.sourceRefIndex!]
    }));

  const updateResult = await TransactionModel.bulkWrite(
    idRefIdObjArray.map(u => ({
      updateOne: {
        filter: { _id: u.id },
        update: { $set: { refId: u.refId } }
      }
    })),
    { session },
  );

  if (updateResult.modifiedCount !== idRefIdObjArray.length)
    throw new AppError(409, "Not all expected transctions were updated with reference id")

  // TODO save proper source index counter for this test user because it just goes from 0

  return result.insertedCount;
}
