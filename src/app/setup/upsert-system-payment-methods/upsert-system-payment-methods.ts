import { upsertSystemNamedResources } from '@app/setup';
import { PaymentMethodModel } from '@payment-method/model';
import { SYSTEM_PAYMENT_METHOD_NAMES } from '@utils/consts';

export const upsertSystemPaymentMethods = async () =>
  upsertSystemNamedResources(PaymentMethodModel, SYSTEM_PAYMENT_METHOD_NAMES);
