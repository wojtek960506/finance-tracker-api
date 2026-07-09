import { describe, expect, it, Mock, vi } from 'vitest';

import { TransactionModel } from '@transaction/model';
import { randomObjectIdString } from '@utils/random';

import { streamTransactions } from './stream-transactions';

const mockResult = 'cursor';
const mockQuery = {
  find: vi.fn().mockReturnThis(),
  sort: vi.fn().mockReturnThis(),
  cursor: vi.fn().mockReturnValue(mockResult),
};

vi.mock('@transaction/model', () => ({ TransactionModel: { find: vi.fn() } }));

describe('streamTransactions', () => {
  it('stream transactions', () => {
    const FILTER = {
      ownerId: randomObjectIdString(),
      deletion: null,
    };
    (TransactionModel.find as Mock).mockReturnValue(mockQuery);

    const result = streamTransactions(FILTER as any);

    expect(TransactionModel.find).toHaveBeenCalledOnce();
    expect(TransactionModel.find).toHaveBeenCalledWith(FILTER);
    expect(mockQuery.sort).toHaveBeenCalledOnce();
    expect(mockQuery.sort).toHaveBeenCalledWith({ sourceIndex: 1 });
    expect(mockQuery.cursor).toHaveBeenCalledOnce();
    expect(result).toEqual(mockResult);
  });
});
