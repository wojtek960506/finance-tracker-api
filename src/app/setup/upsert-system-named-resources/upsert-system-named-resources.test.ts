import { afterEach, describe, expect, it, vi } from 'vitest';

import { withSession } from '@utils/with-session';

import { upsertSystemNamedResources } from './upsert-system-named-resources';

const sessionMock = {} as any;

const modelMock = { updateOne: vi.fn().mockResolvedValue({} as any) };
const names = new Set(['name1', 'name2']);

vi.mock('@utils/with-session', () => ({
  withSession: vi
    .fn()
    .mockImplementation(async (func, ...args) => await func(sessionMock, ...args)),
}));

describe('upsertSystemNamedResources', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to withSession', async () => {
    await upsertSystemNamedResources(modelMock as any, names);

    expect(withSession).toHaveBeenCalledOnce();
  });

  it('upserts all expected system named resources', async () => {
    await upsertSystemNamedResources(modelMock as any, names);

    const namesArr = Array.from(names);

    expect(modelMock.updateOne).toHaveBeenCalledTimes(namesArr.length);

    namesArr.forEach((name, index) => {
      const doc = {
        type: 'system',
        name,
        nameNormalized: name.toLowerCase(),
      };
      expect(modelMock.updateOne).toHaveBeenNthCalledWith(
        index + 1,
        doc,
        { $setOnInsert: doc },
        { upsert: true, session: sessionMock },
      );
    });
  });
});
