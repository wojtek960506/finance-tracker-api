import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as findInstrumentByIdModule from './find-instrument-by-id';
import * as findOrCreateInstrumentModule from './find-or-create-instrument';
import { resolveInstrumentId } from './resolve-instrument-id';

describe('resolveInstrumentId', () => {
  const ownerId = '507f1f77bcf86cd799439011';
  const existingInstrumentId = '507f1f77bcf86cd799439012';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to findInstrumentById when instrumentId is provided', async () => {
    const mockInstrument = {
      _id: { toString: () => existingInstrumentId },
    };
    vi.spyOn(findInstrumentByIdModule, 'findInstrumentById').mockResolvedValue(
      mockInstrument as any,
    );

    const session = {} as any;
    const result = await resolveInstrumentId(
      ownerId,
      {
        instrumentId: existingInstrumentId,
        operationKind: 'buy',
      },
      'USD',
      session,
    );

    expect(findInstrumentByIdModule.findInstrumentById).toHaveBeenCalledWith(
      ownerId,
      existingInstrumentId,
      session,
    );
    expect(result).toBe(existingInstrumentId);
  });

  it('delegates to findOrCreateInstrument when newInstrument is provided', async () => {
    const newInstrument = {
      name: 'Tesla Inc.',
      kind: 'share' as const,
      currency: 'USD' as const,
    };
    vi.spyOn(findOrCreateInstrumentModule, 'findOrCreateInstrument').mockResolvedValue(
      existingInstrumentId,
    );

    const session = {} as any;
    const result = await resolveInstrumentId(
      ownerId,
      {
        newInstrument,
        operationKind: 'buy',
      },
      'USD',
      session,
    );

    expect(findOrCreateInstrumentModule.findOrCreateInstrument).toHaveBeenCalledWith(
      ownerId,
      newInstrument,
      'USD',
      session,
    );
    expect(result).toBe(existingInstrumentId);
  });
});
