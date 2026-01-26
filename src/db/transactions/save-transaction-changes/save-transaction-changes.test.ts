import { randomObjectIdString } from "@utils/random";
import { describe, expect, it, Mock, vi } from "vitest";
import { saveTransactionChanges } from "@db/transactions/";
import { serializeTransaction } from "@schemas/serialize-transaction";
import {
  getTransactionStandardDTO,
  getStandardTransactionProps,
  getStandardTransactionResultJSON,
} from "@/test-utils/mocks/transactions";


vi.mock("@schemas/serialize-transaction", () => ({
  serializeTransaction: vi.fn(),
}));

describe("saveTransactionChanges", async () => {
  
  const TRANSACTION_ID = randomObjectIdString();
  const SOURCE_INDEX = 1;
  const OWNER_ID = randomObjectIdString();

  const saveMock = vi.fn();

  const newProps = { ...getTransactionStandardDTO(), amount: 123 }

  const transaction = {
    ...getStandardTransactionProps(OWNER_ID, SOURCE_INDEX),
    _id: TRANSACTION_ID,
    save: saveMock,
  } as any;

  const transactionAfterUpdate = { ...transaction, amount: 123 }

  const transactionAfterSerialization = {
    ...getStandardTransactionResultJSON(OWNER_ID, SOURCE_INDEX, TRANSACTION_ID),
    amount: 123,
  }

  it("save single transaction changes ", async () => {
     (serializeTransaction as Mock).mockReturnValue(transactionAfterSerialization);

     const result = await saveTransactionChanges(transaction, newProps);

     expect(saveMock).toHaveBeenCalledOnce();
     expect(serializeTransaction).toHaveBeenCalledOnce();
     expect(serializeTransaction).toHaveBeenCalledWith(transactionAfterUpdate);
     expect(result).toEqual(transactionAfterSerialization);
  });
})