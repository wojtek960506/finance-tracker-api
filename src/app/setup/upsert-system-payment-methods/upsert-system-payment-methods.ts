import { upsertSystemNamedResources } from '@app/setup';
import { getNamedResourceModel } from '@shared/named-resource';
import { SYSTEM_PAYMENT_METHOD_NAMES } from '@utils/consts';

export const upsertSystemPaymentMethods = async () =>
  upsertSystemNamedResources(
    getNamedResourceModel('paymentMethod'),
    SYSTEM_PAYMENT_METHOD_NAMES,
  );
