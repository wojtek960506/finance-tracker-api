import { ClientSession } from "mongoose";
import { PAYMENT_METHODS } from "@utils/consts";
import { withSession } from "@utils/with-session";
import { PaymentMethodModel } from "@payment-method/model";


const upsertSystemPaymentMethodsCore = async (session: ClientSession) => {
  // TODO think whether all values from PAYMENT_METHODS should be of type "system"
  // or should we create some new set in this file and keep the old one for the legacy data
  // from my private spreadsheets
  for (const paymentMethodName of PAYMENT_METHODS) {
    const doc = {
      type: "system",
      name: paymentMethodName,
      nameNormalized: paymentMethodName.toLowerCase(),
    };
    await PaymentMethodModel.updateOne(doc, { $setOnInsert: doc }, { upsert: true, session });
  }
};

export const upsertSystemPaymentMethods = async () => (
  withSession(upsertSystemPaymentMethodsCore)
);

