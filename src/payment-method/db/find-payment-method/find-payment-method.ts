import { normalizeWhitespace } from "@utils/strings"
import { PaymentMethodModel } from "@payment-method/model"
import { PaymentMethodNotFoundError } from "@utils/errors"


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
