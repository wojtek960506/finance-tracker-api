import { IInvestmentInstrument, InvestmentOperationModel } from '@investment/model';
import { InvestmentInstrumentKind } from '@investment/types';

export interface TransactionInvestmentDetailsResponse {
  operationKind: 'buy' | 'sell' | 'interest' | 'fee';
  instrument: {
    id: string;
    name: string;
    kind: InvestmentInstrumentKind;
    currency: string;
  };
  note?: string;
}

export type InvestmentOperationsMap = Record<
  string,
  TransactionInvestmentDetailsResponse
>;

export const prepareInvestmentOperationsMap = async (
  ownerId: string,
  transactionIds: string[],
): Promise<InvestmentOperationsMap> => {
  if (transactionIds.length === 0) {
    return {};
  }

  const operations = await InvestmentOperationModel.find({
    ownerId,
    transactionId: { $in: transactionIds },
  }).populate<{ instrumentId: IInvestmentInstrument }>('instrumentId');

  const map: InvestmentOperationsMap = {};
  for (const op of operations) {
    if (op.transactionId && op.instrumentId) {
      const instrument = op.instrumentId as unknown as IInvestmentInstrument;
      map[op.transactionId.toString()] = {
        operationKind: op.kind as 'buy' | 'sell' | 'interest' | 'fee',
        instrument: {
          id: instrument._id.toString(),
          name: instrument.name,
          kind: instrument.kind,
          currency: instrument.currency,
        },
        ...(op.note ? { note: op.note } : {}),
      };
    }
  }

  return map;
};
