import { FilterQuery, Types } from 'mongoose';

import { prepareNamedResourcesMap } from '@named-resource/services';

import { SportEntryModel } from '../../model';
import {
  SportStatsCategoryDTO,
  SportStatsMonthDTO,
  SportStatsQueryDTO,
  SportStatsResponseDTO,
  SportStatsYearDTO,
} from '../../schema';

const roundCurrency = (val: number): number =>
  Math.round((val + Number.EPSILON) * 100) / 100;

type OverallRow = {
  _id: null;
  totalCostPln: number;
  totalEntries: number;
};

type CategoryRow = {
  _id: Types.ObjectId;
  totalCostPln: number;
  entryCount: number;
};

type YearRow = {
  _id: number;
  totalCostPln: number;
  entryCount: number;
};

type MonthRow = {
  _id: {
    year: number;
    month: number;
  };
  totalCostPln: number;
  entryCount: number;
};

type StatsAggregationResult = {
  overall: OverallRow[];
  byCategory: CategoryRow[];
  byYear: YearRow[];
  byMonth: MonthRow[];
};

export const getSportStats = async (
  ownerId: string,
  query: SportStatsQueryDTO = {},
): Promise<SportStatsResponseDTO> => {
  const matchStage: FilterQuery<any> = {
    ownerId: new Types.ObjectId(ownerId),
  };

  if (query.year) {
    matchStage.date = {
      $gte: new Date(Date.UTC(query.year, 0, 1, 0, 0, 0, 0)),
      $lt: new Date(Date.UTC(query.year + 1, 0, 1, 0, 0, 0, 0)),
    };
  }

  const [facetResult] = await SportEntryModel.aggregate<StatsAggregationResult>([
    { $match: matchStage },
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              totalCostPln: { $sum: '$costPln' },
              totalEntries: { $sum: 1 },
            },
          },
        ],
        byCategory: [
          {
            $group: {
              _id: '$categoryId',
              totalCostPln: { $sum: '$costPln' },
              entryCount: { $sum: 1 },
            },
          },
          {
            $sort: { totalCostPln: -1, entryCount: -1 },
          },
        ],
        byYear: [
          {
            $group: {
              _id: { $year: '$date' },
              totalCostPln: { $sum: '$costPln' },
              entryCount: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ],
        byMonth: [
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
              },
              totalCostPln: { $sum: '$costPln' },
              entryCount: { $sum: 1 },
            },
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1 },
          },
        ],
      },
    },
  ]);

  const overall = facetResult?.overall?.[0] ?? { totalCostPln: 0, totalEntries: 0 };
  const overallTotalCostPln = roundCurrency(overall.totalCostPln);
  const totalEntries = overall.totalEntries;

  const categoryIds = (facetResult?.byCategory ?? []).map((cat) => cat._id.toString());
  const categoriesMap =
    categoryIds.length > 0
      ? await prepareNamedResourcesMap('sportCategory', ownerId, categoryIds)
      : {};

  const byCategory: SportStatsCategoryDTO[] = (facetResult?.byCategory ?? []).map(
    (cat) => {
      const categoryId = cat._id.toString();
      const resource = categoriesMap[categoryId];
      const catCost = roundCurrency(cat.totalCostPln);
      const percentage =
        overallTotalCostPln > 0
          ? Math.min(
              100,
              Math.max(0, roundCurrency((catCost / overallTotalCostPln) * 100)),
            )
          : 0;

      return {
        categoryId,
        categoryName: resource?.name ?? 'Unknown',
        categoryKey: resource?.type === 'system' ? resource.name.toLowerCase() : null,
        type: resource?.type ?? 'user',
        totalCostPln: catCost,
        entryCount: cat.entryCount,
        percentage,
      };
    },
  );

  const byYear: SportStatsYearDTO[] = (facetResult?.byYear ?? []).map((y) => ({
    year: y._id,
    totalCostPln: roundCurrency(y.totalCostPln),
    entryCount: y.entryCount,
  }));

  const byMonth: SportStatsMonthDTO[] = (facetResult?.byMonth ?? []).map((m) => ({
    year: m._id.year,
    month: m._id.month,
    totalCostPln: roundCurrency(m.totalCostPln),
    entryCount: m.entryCount,
  }));

  return {
    totalCostPln: overallTotalCostPln,
    totalEntries,
    byCategory,
    byYear,
    byMonth,
  };
};
