import { findTransactionTotalsByCurrency, findTransactionTotalsOverall } from "@db/transactions/find-transaction-totals/find-transaction-totals";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";


vi.mock("@models/transaction-model", () => ({
  TransactionModel: { aggregate: vi.fn() }
}));

describe("find transaction totals", () => {
  const RESULT = "result";
  const FILTER = { year: 2026 }

  afterEach(() => { vi.clearAllMocks() });

  it('find transaction totals overall', async () => {
    (TransactionModel.aggregate as Mock).mockResolvedValue(RESULT);

    const result = await findTransactionTotalsOverall(FILTER);

    expect(result).toEqual(RESULT);
    expect(TransactionModel.aggregate).toHaveBeenCalledOnce();
    expect(TransactionModel.aggregate).toHaveBeenCalledWith([
      { $match: FILTER },
      { $group: { 
        _id: { transactionType: "$transactionType" },
        totalItems: { $sum: 1 },
      }},
      { $sort: {"_id.transactionType": 1 } },
    ])
  });

  it('find transaction totals overall', async () => {
    (TransactionModel.aggregate as Mock).mockResolvedValue(RESULT);

    const result = await findTransactionTotalsByCurrency(FILTER);

    expect(result).toEqual(RESULT);
    expect(TransactionModel.aggregate).toHaveBeenCalledOnce();
    expect(TransactionModel.aggregate).toHaveBeenCalledWith([
      { $match: FILTER },
      { $group: { 
        _id: { currency: "$currency", transactionType: "$transactionType" },
        totalAmount: { $sum: "$amount" },
        totalItems: { $sum: 1 },
        averageAmount: { $avg: "$amount" },
        maxAmount: { $max: "$amount" },
        minAmount: { $min: "$amount" },
      }},
      { $sort: { "_id.currency": 1, "_id.transactionType": 1 } },
    ])
  });
})