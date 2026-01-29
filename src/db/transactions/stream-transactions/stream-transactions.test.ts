import { describe, expect, it, Mock, vi } from "vitest";
import { randomObjectIdString } from "@utils/random";
import { streamTransactions } from "./stream-transactions";
import { TransactionModel } from "@models/transaction-model";


const mockResult = "cursor";
const mockQuery = {
  find: vi.fn().mockReturnThis(),
  sort: vi.fn().mockReturnThis(),
  cursor: vi.fn().mockReturnValue(mockResult),
}

vi.mock("@models/transaction-model", () => ({ TransactionModel: { find: vi.fn() } }));

describe("streamTransactions", () => {
  it("stream transactions", () => {
    const OWNER_ID = randomObjectIdString();
    (TransactionModel.find as Mock).mockReturnValue(mockQuery);

    const result = streamTransactions(OWNER_ID);

    expect(TransactionModel.find).toHaveBeenCalledOnce();
    expect(TransactionModel.find).toHaveBeenCalledWith({ ownerId: OWNER_ID });
    expect(mockQuery.sort).toHaveBeenCalledOnce();
    expect(mockQuery.sort).toHaveBeenCalledWith({ sourceIndex: 1 });
    expect(mockQuery.cursor).toHaveBeenCalledOnce();
    expect(result).toEqual(mockResult);
  })
})