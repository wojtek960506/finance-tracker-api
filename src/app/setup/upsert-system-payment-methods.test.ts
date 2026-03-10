import { upsertSystemPaymentMethods } from "app/setup/upsert-system-payment-methods";
import { describe, expect, it, Mock, vi } from "vitest";

import { upsertSystemNamedResources } from "@app/setup";
import { SYSTEM_PAYMENT_METHOD_NAMES } from "@utils/consts";

import { PaymentMethodModel } from "@/payment-method/model";

vi.mock("@app/setup", () => ({
  upsertSystemNamedResources: vi.fn(),
}));

describe('upsertSystemPaymentMethods', () => {

  it('delegates to upsertSystemNamedResources', async () => {
    (upsertSystemNamedResources as Mock).mockResolvedValue({} as any);

    await upsertSystemPaymentMethods();

    expect(upsertSystemNamedResources).toHaveBeenCalledOnce();
    expect(upsertSystemNamedResources).toHaveBeenCalledWith(
      PaymentMethodModel, SYSTEM_PAYMENT_METHOD_NAMES
    );
  });
});
