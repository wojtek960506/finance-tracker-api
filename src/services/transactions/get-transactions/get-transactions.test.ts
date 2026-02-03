import { randomObjectIdString } from "@utils/random";
import { describe, expect, it, Mock, vi } from "vitest";
import { getTransactions } from "@services/transactions";
import { serializeTransaction } from "@schemas/serializers";
import { findTransactions, findTransactionsCount } from "@db/transactions";
import { getStandardTransactionResultJSON } from "@/test-utils/mocks/transactions";


vi.mock("@db/transactions", () => ({
  findTransactions: vi.fn(),
  findTransactionsCount: vi.fn(),
}));

vi.mock("@schemas/serializers", () => ({ serializeTransaction: vi.fn() }));

describe('getTransactionsTest', () => {
  
  it("get transactions", async () => {
    const USER_ID = randomObjectIdString();
    const TOTAL = 2;
    const transaction1 = getStandardTransactionResultJSON(USER_ID, 1, "1");
    const transaction2 = getStandardTransactionResultJSON(USER_ID, 2, "2");
    const query = { page: 1, limit: 10, sortBy: "date", sortOrder: "desc" } as const;

    (findTransactions as Mock).mockResolvedValue([transaction1, transaction2]);
    (findTransactionsCount as Mock).mockResolvedValue(TOTAL);
    (serializeTransaction as Mock).mockReturnValueOnce(transaction1);
    (serializeTransaction as Mock).mockReturnValueOnce(transaction2);    

    const result = await getTransactions(query, USER_ID);
    
    expect(findTransactions).toHaveBeenCalledOnce();
    expect(findTransactionsCount).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      page: query.page,
      limit: query.limit,
      total: TOTAL,
      totalPages: 1,
      items: [transaction1, transaction2]
    });
  });
});
