import { FilterQuery, Types } from 'mongoose';

import { INamedResource } from '@named-resource';

import { ISportEntry, SportEntryModel } from '../../model';
import { SportEntryFilterQueryDTO, SportEntryListResponseDTO } from '../../schema';
import { serializeSportEntry } from '../../serializers';

export const listSportEntries = async (
  ownerId: string,
  query: SportEntryFilterQueryDTO,
): Promise<SportEntryListResponseDTO> => {
  const filter: FilterQuery<ISportEntry> = {
    ownerId: new Types.ObjectId(ownerId),
  };

  if (query.categoryId) {
    filter.categoryId = new Types.ObjectId(query.categoryId);
  }

  if (query.startDate || query.endDate) {
    filter.date = {
      ...(query.startDate ? { $gte: query.startDate } : {}),
      ...(query.endDate ? { $lte: query.endDate } : {}),
    };
  }

  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.itemName = { $regex: escaped, $options: 'i' };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    date_desc: { date: -1, _id: -1 },
    date_asc: { date: 1, _id: 1 },
    cost_desc: { costPln: -1, _id: -1 },
    cost_asc: { costPln: 1, _id: 1 },
  };

  const sortOrder = sortMap[query.sort] ?? sortMap.date_desc;
  const skip = (query.page - 1) * query.limit;

  const [entries, total] = await Promise.all([
    SportEntryModel.find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(query.limit)
      .populate<{ categoryId: INamedResource }>('categoryId'),
    SportEntryModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / query.limit);

  const items = entries.map((entry) => serializeSportEntry(entry));

  return {
    items,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    },
  };
};
