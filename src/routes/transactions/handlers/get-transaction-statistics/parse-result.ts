import { TransactionStatisticsQuery } from "@schemas/transaction-query";
import {
  YearResult,
  NoYearResult,
  TotalAmountAndItems,
  TotalAmountAndItemsObj,
  YearlyResultItemServer,
  MonthlyResultItemServer,
  TransactionStatisticsResponse,
} from "@routes/transactions/types";


const getTotalAmountAndItems = (
  resultItem: TotalAmountAndItems | undefined
): TotalAmountAndItems => {
  if (!resultItem) return { totalAmount: 0, totalItems: 0 };
  return {
    totalAmount: resultItem.totalAmount,
    totalItems: resultItem.totalItems,
  }
};

export const parseStatisticsResult = (
  result : any[],
  q: TransactionStatisticsQuery
): TransactionStatisticsResponse => {

  if (!result || result.length === 0) return { totalAmount: 0, totalItems: 0 };

  const data = result![0];
 
  if (q.year) {
    if (q.month) {
      return getTotalAmountAndItems(data);
    } else {
      const returnData = {} as YearResult;

      returnData.allTime = getTotalAmountAndItems(data.allTime?.[0]);

      const monthlyData = {} as TotalAmountAndItemsObj;
      data.monthly.forEach((resultItem: MonthlyResultItemServer) => {
        monthlyData[resultItem._id.month] = getTotalAmountAndItems(resultItem);
      });
      returnData.monthly = monthlyData;

      return returnData;
    }
  } else {
    const returnData = {} as NoYearResult;

    returnData.allTime = getTotalAmountAndItems(data.allTime?.[0]);

    const yearlyData = {} as TotalAmountAndItemsObj;
    data.yearly.forEach((resultItem: YearlyResultItemServer) => {
      yearlyData[resultItem._id.year] = getTotalAmountAndItems(resultItem);
    });
    returnData.yearly = yearlyData;

    return returnData;
  }
}