import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { getStandardTransactionProps } from "@/test-utils/mocks/transactions";


describe("serializeTransaction", () => {
  const OWNER_ID_OBJ = new Types.ObjectId();
  const T_ID_OBJ = new Types.ObjectId();
  const T_REF_ID_OBJ = new Types.ObjectId();

  const OWNER_ID_STR = OWNER_ID_OBJ.toHexString();
  const T_ID_STR = T_ID_OBJ.toHexString();
  const T_REF_ID_STR = T_REF_ID_OBJ.toHexString();

  const props = getStandardTransactionProps(OWNER_ID_STR, 1);
  const transaction = { ...props, _id: T_ID_OBJ, ownerId: OWNER_ID_OBJ };
  const iTransaction = {
    ...transaction,
    toObject: () => ({ ...transaction, __v: 1, _id: T_ID_OBJ, refId: T_REF_ID_OBJ }),
  }

  it("serialize transaction", () => {
    const result = serializeTransaction(iTransaction as any);
    expect(result).toEqual({ ...props, id: T_ID_STR, refId: T_REF_ID_STR });
  })
})