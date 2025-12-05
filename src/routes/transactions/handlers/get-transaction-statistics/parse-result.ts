import { TransactionStatisticsQuery } from "@schemas/transaction-query";

type TotalAmountAndItems = {
  totalAmount: number;
  totalItems: number;
}

export type MonthYearResult = TotalAmountAndItems;

type MonthlyResultItemServer = TotalAmountAndItems & {
  _id: {
    month: number,
  },
}

type MonthlyResult = (TotalAmountAndItems & { month: number })[];

export type YearResult = {
  allTimeByYear: TotalAmountAndItems;
  monthly: MonthlyResult;
}

type YearlyResultItemServer = TotalAmountAndItems & {
  _id: {
    year: number,
  },
}

type YearlyResult = (TotalAmountAndItems & { year: number })[];

export type MonthResult = {
  allTimeByMonth: TotalAmountAndItems;
  yearly: YearlyResult;
}

const getTotalAmountAndItems = (resultItem: TotalAmountAndItems) => ({
  totalAmount: resultItem.totalAmount,
  totalItems: resultItem.totalItems,
});

export const parseStatisticsResult = (
  result : any[],
  q: TransactionStatisticsQuery
): MonthYearResult | YearResult | MonthResult => {
  if (q.year && q.month) {
    const data = result![0];

    return {
      totalAmount: data.totalAmount,
      totalItems: data.totalItems,
    }
  } else if (q.year) {
    const data = result![0];
    const returnData = {} as YearResult;

    returnData.allTimeByYear = getTotalAmountAndItems(data.allTimeByYear![0]);

    const monthlyData = [] as MonthlyResult;
    data.monthly.forEach((resultItem: MonthlyResultItemServer) => {
      monthlyData.push({
        ...getTotalAmountAndItems(resultItem),
        month: resultItem._id.month,
      })
    });
    returnData.monthly = monthlyData;

    return returnData;
  } else {
    const data = result![0];
    const returnData = {} as MonthResult;

    console.log(data.allTimeByMonth);

    returnData.allTimeByMonth = getTotalAmountAndItems(data.allTimeByMonth![0]);

    const yearlyData = [] as YearlyResult;
    data.yearly.forEach((resultItem: YearlyResultItemServer) => {
      yearlyData.push({
        ...getTotalAmountAndItems(resultItem),
        year: resultItem._id.year,
      })
    });
    returnData.yearly = yearlyData;

    return returnData;
  }
}