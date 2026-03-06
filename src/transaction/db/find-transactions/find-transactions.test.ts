import { randomObjectIdString } from "@utils/random"
import { TransactionModel } from "@transaction/model"
import { it, vi, Mock, expect, describe, afterEach } from "vitest"
import { findTransactions, findTransactionsCount } from "@transaction/db"


const mockResult = ["a"];
const mockQuery = {
  sort: vi.fn().mockReturnThis(),
  skip: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue(mockResult),
}

vi.mock("@transaction/model", () => ({
  TransactionModel: { find: vi.fn(), countDocuments: vi.fn() }
}));

describe("find transactions", () => {
  const query = { page: 1, limit: 10, sortBy: "date", sortOrder: "desc" } as const;
  const filter = { ownerId: randomObjectIdString() };

  afterEach(() => { vi.clearAllMocks() });

  it.each<["asc" | "desc", number]>(
    [["desc", -1], ["asc", 1]]
  )("findTransactions - sort order '%s'", async (sortOrder, sortResult) => {
    (TransactionModel.find as Mock).mockReturnValue(mockQuery);

    const result = await findTransactions(filter, { ...query, sortOrder });

    expect(mockQuery.sort).toHaveBeenCalledOnce();
    expect(mockQuery.sort).toHaveBeenCalledWith(
      { date: sortResult, sourceIndex: sortResult }
    );
    expect(mockQuery.skip).toHaveBeenCalledOnce();
    expect(mockQuery.skip).toHaveBeenCalledWith(0);
    expect(mockQuery.limit).toHaveBeenCalledOnce();
    expect(mockQuery.limit).toHaveBeenCalledWith(10);
    expect(result).toEqual(mockResult);
  })

  it("findTranscationCount", async () => {
    const COUNT = 1;
    (TransactionModel.countDocuments as Mock).mockResolvedValue(COUNT);
    const result = await findTransactionsCount(filter);
    expect(TransactionModel.countDocuments).toHaveBeenCalledOnce();
    expect(result).toEqual(COUNT);
  })

})