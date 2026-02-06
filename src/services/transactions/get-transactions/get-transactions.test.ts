import * as services from "@services/categories";
import { describe, expect, it, Mock, vi } from "vitest";
import { getTransactions } from "@services/transactions";
import { serializeTransaction } from "@schemas/serializers";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { findTransactions, findTransactionsCount } from "@db/transactions";
import {
  getStandardTransactionResultSerialized,
  getTransferTransactionResultSerialized,
  getStandardTransactionNotPopulatedResultJSON,
  getTransferTransactionNotPopulatedResultJSON,
} from "@/test-utils/factories/transaction";


vi.mock("@db/transactions", () => ({
  findTransactions: vi.fn(),
  findTransactionsCount: vi.fn(),
}));

vi.mock("@schemas/serializers", () => ({ serializeTransaction: vi.fn() }));

describe('getTransactionsTest', () => {
  it("get transactions", async () => {
    const total = 3;
    const tmpCategoriesMap = { "key": "value" } as any;

    const transactionNotPopulatedJSON = getStandardTransactionNotPopulatedResultJSON();
    const {
      expenseTransactionNotPopulatedJSON,
      incomeTransactionNotPopulatedJSON,
    } = getTransferTransactionNotPopulatedResultJSON();
    const transactionSerialized = getStandardTransactionResultSerialized();
    const {
      expenseTransactionSerialized,
      incomeTransactionSerialized,
    } = getTransferTransactionResultSerialized();
    const query = { page: 1, limit: 10, sortBy: "date", sortOrder: "desc" } as const;

    (findTransactions as Mock).mockResolvedValue([
      transactionNotPopulatedJSON,
      expenseTransactionNotPopulatedJSON,
      incomeTransactionNotPopulatedJSON,
    ]);
    (findTransactionsCount as Mock).mockResolvedValue(total);
    (serializeTransaction as Mock)
      .mockReturnValueOnce(transactionSerialized)
      .mockReturnValueOnce(expenseTransactionSerialized)
      .mockReturnValueOnce(incomeTransactionSerialized);
    vi.spyOn(services, "prepareCategoriesMap").mockResolvedValue(tmpCategoriesMap)

    const result = await getTransactions(query, USER_ID_STR);
    
    expect(findTransactions).toHaveBeenCalledOnce();
    expect(findTransactionsCount).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledTimes(total);
    expect(serializeTransaction).toHaveBeenNthCalledWith(
      1, transactionNotPopulatedJSON, tmpCategoriesMap
    );
    expect(serializeTransaction).toHaveBeenNthCalledWith(
      2, expenseTransactionNotPopulatedJSON, tmpCategoriesMap
    );
    expect(serializeTransaction).toHaveBeenNthCalledWith(
      3, incomeTransactionNotPopulatedJSON, tmpCategoriesMap
    );
    expect(result).toEqual({
      page: query.page,
      limit: query.limit,
      total: total,
      totalPages: 1,
      items: [transactionSerialized, expenseTransactionSerialized, incomeTransactionSerialized]
    });
  });
});
