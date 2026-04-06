import { describe, expect, it } from 'vitest';

import {
  getSystemExpenseAccountResultSerialized,
  getSystemIncomeAccountResultSerialized,
} from '@testing/factories/account';
import { TRANSFER_CATEGORY_ID_STR } from '@testing/factories/category';
import { USER_ID_STR } from '@testing/factories/general';
import {
  getTransferTransactionDTO,
  getTransferTransactionProps,
  TRANSFER_TXN_EXPENSE_SRC_IDX,
  TRANSFER_TXN_INCOME_SRC_IDX,
} from '@testing/factories/transaction';

import { prepareTransferProps } from './prepare-transfer-props';

describe('prepareTransferProps', () => {
  it('prepare props for create', () => {
    const dto = getTransferTransactionDTO();
    const mockProps = getTransferTransactionProps(true);
    const accountExpense = getSystemExpenseAccountResultSerialized();
    const accountIncome = getSystemIncomeAccountResultSerialized();

    const { expenseTransactionProps, incomeTransactionProps } = prepareTransferProps(
      dto,
      { categoryId: TRANSFER_CATEGORY_ID_STR },
      {
        ownerId: USER_ID_STR,
        sourceIndexExpense: TRANSFER_TXN_EXPENSE_SRC_IDX,
        sourceIndexIncome: TRANSFER_TXN_INCOME_SRC_IDX,
        accountExpenseName: accountExpense.name,
        accountIncomeName: accountIncome.name,
      },
    );

    expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
    expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
  });

  it('prepare props for update', () => {
    const dto = getTransferTransactionDTO();
    delete (dto as { additionalDescription?: string }).additionalDescription;
    const mockProps = getTransferTransactionProps();
    const accountExpense = getSystemExpenseAccountResultSerialized();
    const accountIncome = getSystemIncomeAccountResultSerialized();

    const { expenseTransactionProps, incomeTransactionProps } = prepareTransferProps(
      dto,
      { categoryId: TRANSFER_CATEGORY_ID_STR },
    );

    mockProps.expenseProps.description = `${accountExpense.id} --> ${accountIncome.id}`;
    mockProps.incomeProps.description = `${accountExpense.id} --> ${accountIncome.id}`;

    expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
    expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
  });
});
