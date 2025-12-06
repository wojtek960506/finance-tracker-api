import { TransactionStatisticsQuery } from "@schemas/transaction-query";

type TotalAmountAndItems = {
  totalAmount: number;
  totalItems: number;
}

export type MonthYearResult = TotalAmountAndItems;

type TotalAmountAndItemsObj = Record<number, TotalAmountAndItems>;

export type YearResult = {
  allTimeByYear: TotalAmountAndItems;
  monthly: TotalAmountAndItemsObj;
}

export type MonthResult = {
  allTimeByMonth: TotalAmountAndItems;
  yearly: TotalAmountAndItemsObj;
}

type MonthlyResultItemServer = TotalAmountAndItems & {
  _id: {
    month: number,
  },
}

type YearlyResultItemServer = TotalAmountAndItems & {
  _id: {
    year: number,
  },
}

const getTotalAmountAndItems = (resultItem: TotalAmountAndItems | undefined) => {
  if (!resultItem) return { totalAmount: 0, totalItems: 0 };
  return {
    totalAmount: resultItem.totalAmount,
    totalItems: resultItem.totalItems,
  }
};

export const parseStatisticsResult = (
  result : any[],
  q: TransactionStatisticsQuery
): MonthYearResult | YearResult | MonthResult => {

  if (!result || result.length === 0) return { totalAmount: 0, totalItems: 0 }; 
  

  if (q.year && q.month) {
    const data = result![0];

    return getTotalAmountAndItems(data);
  } else if (q.year) {
    const data = result![0];
    const returnData = {} as YearResult;

    returnData.allTimeByYear = getTotalAmountAndItems(data.allTimeByYear?.[0]);

    const monthlyData = {} as TotalAmountAndItemsObj;
    data.monthly.forEach((resultItem: MonthlyResultItemServer) => {
      monthlyData[resultItem._id.month] = getTotalAmountAndItems(resultItem);
    });
    returnData.monthly = monthlyData;

    return returnData;
  } else {
    const data = result![0];
    const returnData = {} as MonthResult;

    console.log(data.allTimeByMonth);

    returnData.allTimeByMonth = getTotalAmountAndItems(data.allTimeByMonth?.[0]);

    const yearlyData = {} as TotalAmountAndItemsObj;
    data.yearly.forEach((resultItem: YearlyResultItemServer) => {
      yearlyData[resultItem._id.year] = getTotalAmountAndItems(resultItem);
    });
    returnData.yearly = yearlyData;

    return returnData;
  }
}