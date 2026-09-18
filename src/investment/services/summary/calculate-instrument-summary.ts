import { IInvestmentInstrument, IInvestmentOperation } from '@investment/model';
import { InvestmentInstrumentSummaryDTO } from '@investment/schema';

import { CurrencyCode } from '@currency/schema';

export const roundMoney = (val: number): number => {
  return Math.round((val + Number.EPSILON) * 100) / 100;
};

export const calculateInstrumentSummary = (
  instrument: IInvestmentInstrument,
  operations: IInvestmentOperation[],
): InvestmentInstrumentSummaryDTO => {
  let totalBought = 0;
  let totalSold = 0;
  let totalInterest = 0;
  let totalFees = 0;
  let latestSnapshot: IInvestmentOperation | null = null;

  for (const op of operations) {
    switch (op.kind) {
      case 'buy':
        totalBought += op.amount;
        break;
      case 'sell':
        totalSold += op.amount;
        break;
      case 'interest':
        totalInterest += op.amount;
        break;
      case 'fee':
        totalFees += op.amount;
        break;
      case 'snapshot':
        if (
          !latestSnapshot ||
          new Date(op.date).getTime() > new Date(latestSnapshot.date).getTime() ||
          (new Date(op.date).getTime() === new Date(latestSnapshot.date).getTime() &&
            new Date(op.createdAt).getTime() >
              new Date(latestSnapshot.createdAt).getTime())
        ) {
          latestSnapshot = op;
        }
        break;
    }
  }

  let currentValue: number;
  let lastSnapshotDate: Date | null = null;

  if (latestSnapshot) {
    currentValue = roundMoney(latestSnapshot.amount);
    lastSnapshotDate = latestSnapshot.date;
  } else {
    currentValue = roundMoney(
      Math.max(0, totalBought - totalSold + totalInterest - totalFees),
    );
  }

  const netInvested =
    currentValue > 0 ? roundMoney(Math.max(0, totalBought - totalSold)) : 0;

  const pnl = roundMoney(currentValue + totalSold - totalBought);

  const roiPercentage = totalBought > 0 ? roundMoney((pnl / totalBought) * 100) : 0;

  return {
    id: instrument._id.toString(),
    name: instrument.name,
    kind: instrument.kind,
    currency: instrument.currency as CurrencyCode,
    currentValue,
    netInvested,
    totalBought: roundMoney(totalBought),
    totalSold: roundMoney(totalSold),
    totalInterest: roundMoney(totalInterest),
    totalFees: roundMoney(totalFees),
    pnl,
    roiPercentage,
    lastSnapshotDate,
    operationsCount: operations.length,
    notes: instrument.notes,
    createdAt: instrument.createdAt,
    updatedAt: instrument.updatedAt,
  };
};
