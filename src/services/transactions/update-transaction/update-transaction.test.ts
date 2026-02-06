import { randomObjectIdString } from "@utils/random";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import {
  findTransaction,
  saveTransactionChanges,
  saveTransactionPairChanges,
  loadTransactionWithReference,
} from "@db/transactions";
import {
  updateStandardTransaction,
  updateExchangeTransaction,
  updateTransferTransaction,
} from "@services/transactions";
import {
  OLD_getTransactionStandardDTO,
  OLD_getTransactionTransferDTO,
  OLD_getTransactionExchangeDTO,
  OLD_getStandardTransactionResultJSON,
  OLD_getTransferTransactionResultJSON,
  OLD_getExchangeTransactionResultJSON,
} from "@/test-utils/mocks/transactions";


vi.mock("@db/transactions", () => ({
  findTransaction: vi.fn(),
  saveTransactionChanges: vi.fn(),
  saveTransactionPairChanges: vi.fn(),
  loadTransactionWithReference: vi.fn(),
}));

describe('update transaction', async () => {
  const [E_ID, I_ID] = [randomObjectIdString(), randomObjectIdString()];
  const [E_SRC_IDX, I_SRC_IDX] = [1, 2];
  const OWNER_ID = randomObjectIdString();

  const expectedExchange = OLD_getExchangeTransactionResultJSON(
    OWNER_ID, E_SRC_IDX, I_SRC_IDX, E_ID, I_ID
  );
  const expectedTransfer = OLD_getTransferTransactionResultJSON(
    OWNER_ID, E_SRC_IDX, I_SRC_IDX, E_ID, I_ID
  );

  afterEach(() => { vi.clearAllMocks() });

  it("update standard transaction", async () => {
    const dto = OLD_getTransactionStandardDTO();
    const expectedResult = OLD_getStandardTransactionResultJSON(OWNER_ID, E_SRC_IDX, E_ID);
    (findTransaction as Mock).mockResolvedValue(expectedResult);
    (saveTransactionChanges as Mock).mockResolvedValue(expectedResult);

    const result = await updateStandardTransaction(E_ID, OWNER_ID, dto);

    expect(result).toEqual(expectedResult);
    expect(findTransaction).toHaveBeenCalledOnce();
    expect(saveTransactionChanges).toHaveBeenCalledOnce();
  })

  it.each([
    ["transfer", expectedTransfer, OLD_getTransactionTransferDTO(), updateTransferTransaction],
    ["exchange", expectedExchange, OLD_getTransactionExchangeDTO(), updateExchangeTransaction],
  ])('udate %s transaction', async (_, expectedResult, dto, updateFunc) => {
    (loadTransactionWithReference as Mock).mockResolvedValue(expectedResult);
    (saveTransactionPairChanges as Mock).mockResolvedValue(expectedResult);

    const result = await updateFunc(E_ID, OWNER_ID, dto as any);

    expect(result).toEqual(expectedResult);
    expect(loadTransactionWithReference).toHaveBeenCalledOnce();
    expect(saveTransactionPairChanges).toHaveBeenCalledOnce();
  })
})