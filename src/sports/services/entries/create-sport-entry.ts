import { Types } from 'mongoose';

import { TransactionModel } from '@transaction/model';
import { TransactionNotFoundError } from '@utils/errors';

import { SportEntryModel } from '../../model';
import { SportEntryCreateDTO, SportEntryResponseDTO } from '../../schema';
import { serializeSportEntry } from '../../serializers';

import { assertSportCategoryAccess } from './assert-sport-category-access';

export const createSportEntry = async (
  ownerId: string,
  dto: SportEntryCreateDTO,
): Promise<SportEntryResponseDTO> => {
  const category = await assertSportCategoryAccess(dto.categoryId, ownerId);

  if (dto.transactionId) {
    const tx = await TransactionModel.findOne({ _id: dto.transactionId, ownerId });
    if (!tx) {
      throw new TransactionNotFoundError(dto.transactionId);
    }
  }

  const entry = await SportEntryModel.create({
    ownerId: new Types.ObjectId(ownerId),
    categoryId: new Types.ObjectId(dto.categoryId),
    date: dto.date,
    itemName: dto.itemName,
    costPln: dto.costPln,
    description: dto.description ?? null,
    transactionId: dto.transactionId ? new Types.ObjectId(dto.transactionId) : null,
  });

  return serializeSportEntry(entry, category);
};
