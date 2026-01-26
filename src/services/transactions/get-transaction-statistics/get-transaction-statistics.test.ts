import { describe, expect, it, Mock, vi } from "vitest";
import { getStatisticsGrouping } from "./get-statistics-grouping";
import { getStatisticsMatching } from "./get-statistics-matching";
import { TransactionModel } from "@models/transaction-model";
import { getTransactionStatistics } from "@services/transactions/get-transaction-statistics/get-transaction-statistics";
import { randomObjectIdString } from "@utils/random";
import { parseStatisticsResult } from "@services/transactions/get-transaction-statistics/parse-statistics-result";


vi.mock(
  "@services/transactions/get-transaction-statistics/get-statistics-grouping",
  () => ({ getStatisticsGrouping: vi.fn() })
);

vi.mock(
  "@services/transactions/get-transaction-statistics/get-statistics-matching",
  () => ({ getStatisticsMatching: vi.fn() })
);

vi.mock(
  "@services/transactions/get-transaction-statistics/parse-statistics-result",
  () => ({ parseStatisticsResult: vi.fn() })
);

vi.mock("@models/transaction-model", () => ({ 
  TransactionModel: { aggregate: vi.fn() }
}));

describe("getTransactionStatistics", () => {
  it("get transaction statistics", async () => {
    const USER_ID = randomObjectIdString();
    const [MATCHING, GROUPING, RESULT] = ["matching", "grouping", "result"];

    (getStatisticsMatching as Mock).mockReturnValue(MATCHING);
    (getStatisticsGrouping as Mock).mockReturnValue(GROUPING);
    (TransactionModel.aggregate as Mock).mockResolvedValue(RESULT);
    (parseStatisticsResult as Mock).mockResolvedValue(RESULT);
    const query = { year: 2026, currency: "PLN", transactionType: "expense" }
    
    const result = await getTransactionStatistics(query, USER_ID);

    expect(getStatisticsMatching).toHaveBeenCalledOnce();
    expect(getStatisticsMatching).toHaveBeenCalledWith(query, USER_ID);
    expect(getStatisticsGrouping).toHaveBeenCalledOnce();
    expect(getStatisticsGrouping).toHaveBeenCalledWith(query);
    expect(TransactionModel.aggregate).toHaveBeenCalledOnce();
    expect(TransactionModel.aggregate).toHaveBeenCalledWith([{ $match: MATCHING }, GROUPING]);
    expect(parseStatisticsResult).toHaveBeenCalledOnce();
    expect(parseStatisticsResult).toHaveBeenCalledWith(RESULT, query);
    expect(result).toEqual(RESULT);
  })
})