import { TransactionModel } from '@transaction/model';
import { CategoryDependencyError, PaymentMethodDependencyError } from '@utils/errors';

type TransactionDependencyProp = 'paymentMethodId' | 'categoryId';

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
    }
  }
};
