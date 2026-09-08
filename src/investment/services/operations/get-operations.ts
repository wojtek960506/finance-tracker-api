import { IInvestmentOperation, InvestmentOperationModel } from '@investment/model';
import {
  InvestmentOperationListResponseDTO,
  InvestmentOperationsQuery,
} from '@investment/schema';
import { serializeOperation } from '@investment/serializers';
import { FilterQuery } from 'mongoose';

export const getOperations = async (
  ownerId: string,
  filter: InvestmentOperationsQuery = {},
): Promise<InvestmentOperationListResponseDTO> => {
  const query: FilterQuery<IInvestmentOperation> = { ownerId };

  if (filter.instrumentId) {
    query.instrumentId = filter.instrumentId;
  }

  if (filter.kind) {
    query.kind = filter.kind;
  }

  if (filter.startDate || filter.endDate) {
    query.date = {};
    if (filter.startDate) {
      query.date.$gte = filter.startDate;
    }
    if (filter.endDate) {
      query.date.$lte = filter.endDate;
    }
  }

  const operations = await InvestmentOperationModel.find(query).sort({
    date: -1,
    createdAt: -1,
  });

  return operations.map(serializeOperation);
};
