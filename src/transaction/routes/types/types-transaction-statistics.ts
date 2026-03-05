export type TotalAmountAndItems = {
  totalAmount: number;
  totalItems: number;
}

export type TotalAmountAndItemsObj = Record<number, TotalAmountAndItems>;

export type MonthYearResult = TotalAmountAndItems;

export type YearResult = {
  allTime: TotalAmountAndItems;
  monthly: TotalAmountAndItemsObj;
}

export type NoYearResult = {
  allTime: TotalAmountAndItems;
  yearly: TotalAmountAndItemsObj;
}

export type TransactionStatisticsResponse = MonthYearResult | YearResult | NoYearResult;

export type MonthlyResultItemServer = TotalAmountAndItems & { _id: { month: number } }

export type YearlyResultItemServer = TotalAmountAndItems & { _id: { year: number } }

