import { describe, expect, it, Mock, vi } from 'vitest';

import { upsertSystemNamedResources } from '@app/setup';
import { getNamedResourceModel } from '@named-resource';
import { SYSTEM_ACCOUNT_NAMES } from '@utils/consts';

import { upsertSystemAccounts } from './upsert-system-accounts';

vi.mock('@app/setup', async () => ({
  upsertSystemNamedResources: vi.fn(),
}));

describe('upsertSystemAccounts', () => {
  it('delegates to upsertSystemNamedResources', async () => {
    (upsertSystemNamedResources as Mock).mockResolvedValue({} as any);

    await upsertSystemAccounts();

    expect(upsertSystemNamedResources).toHaveBeenCalledOnce();
    expect(upsertSystemNamedResources).toHaveBeenCalledWith(
      getNamedResourceModel('account'),
      SYSTEM_ACCOUNT_NAMES,
    );
  });
});
