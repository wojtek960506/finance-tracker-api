import {
  IInvestmentOperation,
  InvestmentInstrumentModel,
  InvestmentOperationModel,
} from '@investment/model';
import {
  InvestmentCurrencySummaryDTO,
  InvestmentInstrumentSummaryDTO,
  InvestmentSummaryResponseDTO,
} from '@investment/schema';

import { CurrencyCode } from '@currency/schema';

import { calculateInstrumentSummary, roundMoney } from './calculate-instrument-summary';

export const getInvestmentSummary = async (
  ownerId: string,
): Promise<InvestmentSummaryResponseDTO> => {
  const [instruments, operations] = await Promise.all([
    InvestmentInstrumentModel.find({ ownerId }).sort({ name: 1 }),
    InvestmentOperationModel.find({ ownerId, deletion: null }).sort({
      date: 1,
      createdAt: 1,
    }),
  ]);

  const operationsByInstrument = new Map<string, IInvestmentOperation[]>();
  for (const op of operations) {
    const key = op.instrumentId.toString();
    const list = operationsByInstrument.get(key);
    if (list) {
      list.push(op);
    } else {
      operationsByInstrument.set(key, [op]);
    }
  }

  const instrumentSummaries: InvestmentInstrumentSummaryDTO[] = instruments.map(
    (instrument) =>
      calculateInstrumentSummary(
        instrument,
        operationsByInstrument.get(instrument._id.toString()) ?? [],
      ),
  );

  const totalsByCurrency: Record<string, InvestmentCurrencySummaryDTO> = {};

  for (const item of instrumentSummaries) {
    const curr = item.currency;
    if (!totalsByCurrency[curr]) {
      totalsByCurrency[curr] = {
        currency: curr as CurrencyCode,
        totalCurrentValue: 0,
        totalNetInvested: 0,
        totalBought: 0,
        totalSold: 0,
        totalInterest: 0,
        totalFees: 0,
        totalPnL: 0,
        roiPercentage: 0,
        instrumentsCount: 0,
      };
    }

    const group = totalsByCurrency[curr];
    group.totalCurrentValue = roundMoney(group.totalCurrentValue + item.currentValue);
    group.totalNetInvested = roundMoney(group.totalNetInvested + item.netInvested);
    group.totalBought = roundMoney(group.totalBought + item.totalBought);
    group.totalSold = roundMoney(group.totalSold + item.totalSold);
    group.totalInterest = roundMoney(group.totalInterest + item.totalInterest);
    group.totalFees = roundMoney(group.totalFees + item.totalFees);
    group.totalPnL = roundMoney(group.totalPnL + item.pnl);
    group.instrumentsCount += 1;
  }

  for (const curr of Object.keys(totalsByCurrency)) {
    const group = totalsByCurrency[curr];
    const totalCostBasis = group.totalBought + group.totalFees;
    group.roiPercentage =
      totalCostBasis > 0 ? roundMoney((group.totalPnL / totalCostBasis) * 100) : 0;
  }

  return {
    totalsByCurrency,
    instruments: instrumentSummaries,
  };
};
