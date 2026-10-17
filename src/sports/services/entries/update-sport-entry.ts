import { Types } from 'mongoose';

import { INamedResource } from '@named-resource';
import { checkOwner } from '@shared/services';
import { TransactionModel } from '@transaction/model';
import { SportEntryNotFoundError, TransactionNotFoundError } from '@utils/errors';

import { SportEntryModel } from '../../model';
import { SportEntryResponseDTO, SportEntryUpdateDTO } from '../../schema';
import { serializeSportEntry } from '../../serializers';

import { assertSportCategoryAccess } from './assert-sport-category-access';

export const updateSportEntry = async (
  ownerId: string,
  entryId: string,
  dto: SportEntryUpdateDTO,
): Promise<SportEntryResponseDTO> => {
  const entry = await SportEntryModel.findById(entryId);

  if (!entry) {
    throw new SportEntryNotFoundError(entryId);
  }

  checkOwner(ownerId, entry._id.toString(), entry.ownerId, 'sportEntry');

  let resolvedCategory: INamedResource | undefined;

  if (dto.categoryId !== undefined) {
    resolvedCategory = await assertSportCategoryAccess(dto.categoryId, ownerId);
    entry.categoryId = new Types.ObjectId(dto.categoryId);
  }

  if (dto.transactionId !== undefined) {
    if (dto.transactionId !== null) {
      const tx = await TransactionModel.findOne({ _id: dto.transactionId, ownerId });
      if (!tx) {
        throw new TransactionNotFoundError(dto.transactionId);
      }
      entry.transactionId = new Types.ObjectId(dto.transactionId);
    } else {
      entry.transactionId = null;
    }
  }

  if (dto.date !== undefined) {
    entry.date = dto.date;
  }
  if (dto.itemName !== undefined) {
    entry.itemName = dto.itemName;
  }
  if (dto.costPln !== undefined) {
    entry.costPln = dto.costPln;
  }
  if (dto.description !== undefined) {
    entry.description = dto.description ?? null;
  }

  await entry.save();

  if (!resolvedCategory) {
    await entry.populate<{ categoryId: INamedResource }>('categoryId');
  }

  return serializeSportEntry(entry, resolvedCategory);
};
