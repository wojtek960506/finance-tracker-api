import {
  IInvestmentOperation,
  InvestmentInstrumentModel,
  InvestmentOperationModel,
} from '@investment/model';
import {
  InvestmentCurrencySummaryDTO,
  InvestmentGrandTotalNormalizedDTO,
  InvestmentInstrumentSummaryDTO,
  InvestmentSummaryQuery,
  InvestmentSummaryResponseDTO,
} from '@investment/schema';

import { CurrencyCode } from '@currency/schema';
import {
  fetchLatestRates,
  getCrossRate,
  isValidCurrencyCode,
  roundMoney,
  USD_CURRENCY_CODE,
} from '@currency/services';

import { calculateInstrumentSummary } from './calculate-instrument-summary';

export const getInvestmentSummary = async (
  ownerId: string,
  query?: InvestmentSummaryQuery,
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

  const baseCurrency = isValidCurrencyCode(query?.baseCurrency)
    ? (query.baseCurrency as CurrencyCode)
    : undefined;

  let grandTotalNormalized: InvestmentGrandTotalNormalizedDTO | undefined;

  if (baseCurrency) {
    const currencyCodesInPortfolio = Object.keys(totalsByCurrency);
    const symbolsToFetch = [
      ...new Set([...currencyCodesInPortfolio, baseCurrency]),
    ].filter((currency) => currency !== USD_CURRENCY_CODE);

    const latestRatesResponse = await fetchLatestRates(symbolsToFetch);
    const rates = latestRatesResponse?.rates ?? null;

    let totalNormCurrentValue = 0;
    let totalNormNetInvested = 0;
    let totalNormPnL = 0;
    let hasValidRates = true;

    for (const curr of currencyCodesInPortfolio) {
      const group = totalsByCurrency[curr];
      const rate = getCrossRate(curr, baseCurrency, rates);

      if (rate !== null) {
        group.normalizedTotalCurrentValue = roundMoney(group.totalCurrentValue * rate);
        group.normalizedTotalNetInvested = roundMoney(group.totalNetInvested * rate);
        group.normalizedTotalPnL = roundMoney(group.totalPnL * rate);

        totalNormCurrentValue = roundMoney(
          totalNormCurrentValue + group.normalizedTotalCurrentValue,
        );
        totalNormNetInvested = roundMoney(
          totalNormNetInvested + group.normalizedTotalNetInvested,
        );
        totalNormPnL = roundMoney(totalNormPnL + group.normalizedTotalPnL);
      } else {
        hasValidRates = false;
      }
    }

    if (hasValidRates) {
      const grandRoi =
        totalNormNetInvested > 0
          ? roundMoney((totalNormPnL / totalNormNetInvested) * 100)
          : 0;

      grandTotalNormalized = {
        currentValue: totalNormCurrentValue,
        netInvested: totalNormNetInvested,
        pnl: totalNormPnL,
        roiPercentage: grandRoi,
      };
    }
  }

  return {
    baseCurrency,
    grandTotalNormalized,
    totalsByCurrency,
    instruments: instrumentSummaries,
  };
};
