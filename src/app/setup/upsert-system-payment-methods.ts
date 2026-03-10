import { upsertSystemNamedResources } from "@app/setup";
import { SYSTEM_PAYMENT_METHOD_NAMES } from "@utils/consts";

import { PaymentMethodModel } from "@/payment-method/model";

export const upsertSystemPaymentMethods = async () =>
  upsertSystemNamedResources(PaymentMethodModel, SYSTEM_PAYMENT_METHOD_NAMES);
