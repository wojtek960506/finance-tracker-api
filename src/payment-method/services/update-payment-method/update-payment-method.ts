import { checkOwner } from "@services/general";
import { normalizeWhitespace } from "@utils/strings";
import { PaymentMethodDTO, PaymentMethodResponseDTO } from "@payment-method/schema";
import { findPaymentMethodById, savePaymentMethodChanges } from "@payment-method/db";
import {
  UserPaymentMethodMissingOwner,
  SystemPaymentMethodUpdateNotAllowed,
} from "@utils/errors";


export const updatePaymentMethod = async (
  paymentMethodId: string,
  ownerId: string,
  dto: PaymentMethodDTO,
): Promise<PaymentMethodResponseDTO> => {
  const paymentMethod = await findPaymentMethodById(paymentMethodId);
  if (paymentMethod.type === "system")
    throw new SystemPaymentMethodUpdateNotAllowed(paymentMethodId);
  if (!paymentMethod.ownerId)
    throw new UserPaymentMethodMissingOwner(paymentMethodId);
  checkOwner(ownerId, paymentMethodId, paymentMethod.ownerId!, "paymentMethod");

  const { name } = dto;
  const newProps = {
    name: normalizeWhitespace(name),
    nameNormalized: normalizeWhitespace(name).toLowerCase(),
  }

  return savePaymentMethodChanges(paymentMethod, newProps);
}
