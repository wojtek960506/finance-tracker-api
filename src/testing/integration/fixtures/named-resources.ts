import { getNamedResourceModel } from '@named-resource';
import {
  SYSTEM_ACCOUNT_NAMES,
  SYSTEM_CATEGORY_NAMES,
  SYSTEM_PAYMENT_METHOD_NAMES,
} from '@utils/consts';

const CategoryModel = getNamedResourceModel('category');
const PaymentMethodModel = getNamedResourceModel('paymentMethod');
const AccountModel = getNamedResourceModel('account');

export const getSystemNamedResources = async () => {
  const [category, paymentMethod, account] = await Promise.all([
    CategoryModel.findOne({ type: 'system', name: [...SYSTEM_CATEGORY_NAMES][0] }),
    PaymentMethodModel.findOne({
      type: 'system',
      name: [...SYSTEM_PAYMENT_METHOD_NAMES][0],
    }),
    AccountModel.findOne({ type: 'system', name: [...SYSTEM_ACCOUNT_NAMES][0] }),
  ]);

  if (!category || !paymentMethod || !account) {
    throw new Error('System named resources are missing in integration test setup');
  }

  return { category, paymentMethod, account };
};
