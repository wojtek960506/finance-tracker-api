import { InvestmentInstrumentModel } from '@investment/model';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findOrCreateInstrument } from './find-or-create-instrument';

vi.mock('@investment/model', () => ({
  InvestmentInstrumentModel: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

describe('findOrCreateInstrument', () => {
  const ownerId = '507f1f77bcf86cd799439011';
  const existingInstrumentId = '507f1f77bcf86cd799439012';
  const newInstrumentId = '507f1f77bcf86cd799439099';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns existing instrument id if matching normalized name is found', async () => {
    const mockExisting = {
      _id: new Types.ObjectId(existingInstrumentId),
      ownerId: new Types.ObjectId(ownerId),
      name: 'Apple Inc.',
      nameNormalized: 'apple inc.',
    };

    vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(mockExisting as any);

    const result = await findOrCreateInstrument(
      ownerId,
      {
        name: '  Apple Inc.  ',
        kind: 'share',
      },
      'USD',
    );

    expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith({
      ownerId,
      nameNormalized: 'apple inc.',
    });
    expect(InvestmentInstrumentModel.create).not.toHaveBeenCalled();
    expect(result).toBe(existingInstrumentId);
  });

  it('creates and returns new instrument if none exists', async () => {
    vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);

    const mockCreated = {
      _id: new Types.ObjectId(newInstrumentId),
      name: 'Tesla Motors',
      nameNormalized: 'tesla motors',
      kind: 'share',
      currency: 'USD',
    };
    vi.mocked(InvestmentInstrumentModel.create).mockResolvedValue([mockCreated] as any);

    const result = await findOrCreateInstrument(
      ownerId,
      {
        name: '  Tesla Motors ',
        kind: 'share',
        notes: 'EV manufacturer',
      },
      'USD',
    );

    expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith({
      ownerId,
      nameNormalized: 'tesla motors',
    });
    expect(InvestmentInstrumentModel.create).toHaveBeenCalledWith(
      [
        {
          ownerId,
          name: 'Tesla Motors',
          nameNormalized: 'tesla motors',
          kind: 'share',
          currency: 'USD',
          notes: 'EV manufacturer',
        },
      ],
      {},
    );
    expect(result).toBe(newInstrumentId);
  });

  it('uses explicit currency when provided in newInstrument', async () => {
    vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);

    const mockCreated = {
      _id: new Types.ObjectId(newInstrumentId),
      name: 'VWRL ETF',
      nameNormalized: 'vwrl etf',
      kind: 'fund',
      currency: 'EUR',
    };
    vi.mocked(InvestmentInstrumentModel.create).mockResolvedValue([mockCreated] as any);

    const mockSession = {} as any;
    const result = await findOrCreateInstrument(
      ownerId,
      {
        name: 'VWRL ETF',
        kind: 'fund',
        currency: 'EUR',
      },
      'USD',
      mockSession,
    );

    expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith(
      {
        ownerId,
        nameNormalized: 'vwrl etf',
      },
      null,
      { session: mockSession },
    );
    expect(InvestmentInstrumentModel.create).toHaveBeenCalledWith(
      [
        {
          ownerId,
          name: 'VWRL ETF',
          nameNormalized: 'vwrl etf',
          kind: 'fund',
          currency: 'EUR',
          notes: undefined,
        },
      ],
      { session: mockSession },
    );
    expect(result).toBe(newInstrumentId);
  });
});
