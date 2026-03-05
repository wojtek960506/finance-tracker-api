import { normalizeWhitespace } from "@utils/strings";
import { PaymentMethodNotFoundError } from "@utils/errors";
import { PaymentMethodModel } from "@payment-method/model";


export const findPaymentMethodById = async (id: string) => {
  const paymentMethod = await PaymentMethodModel.findById(id);
  if (!paymentMethod) throw new PaymentMethodNotFoundError(id);
  return paymentMethod;
}

export const findPaymentMethodByName = async (
  name: string,
  ownerId?: string,
) => {
  return PaymentMethodModel.findOne({
    nameNormalized: normalizeWhitespace(name).toLowerCase(),
    $or: [ 
      { type: "system" },
      { type: "user", ownerId },
    ]
  });
}
