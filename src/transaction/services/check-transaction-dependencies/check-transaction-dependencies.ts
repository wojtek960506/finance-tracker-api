import { TransactionModel } from '@transaction/model';
import {
  AccountDependencyError,
  CategoryDependencyError,
  PaymentMethodDependencyError,
} from '@utils/errors';

type TransactionDependencyProp = 'paymentMethodId' | 'categoryId' | 'accountId';

export const checkTransactionDependencies = async (
  dependencyProp: TransactionDependencyProp,
  dependencyId: string,
) => {
  const count = await TransactionModel.countDocuments({ [dependencyProp]: dependencyId });

  if (count > 0) {
    switch (dependencyProp) {
      case 'categoryId':
        throw new CategoryDependencyError(dependencyId);
      case 'paymentMethodId':
        throw new PaymentMethodDependencyError(dependencyId);
      case 'accountId':
        throw new AccountDependencyError(dependencyId);
    }
  }
};
