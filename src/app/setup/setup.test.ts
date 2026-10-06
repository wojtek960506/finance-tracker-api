import mongoose from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as config from '@app/config';
import { getNamedResourceModel } from '@named-resource';
import { ENV_TEST_VALUES, MONGO_URI_TEST } from '@testing/env-consts';
import {
  SYSTEM_ACCOUNT_NAMES,
  SYSTEM_CATEGORY_NAMES,
  SYSTEM_PAYMENT_METHOD_NAMES,
} from '@utils/consts';
import { withSession } from '@utils/with-session';

import { connectDB } from './connect-db';
import { upsertSystemAccounts } from './upsert-system-accounts';
import { upsertSystemCategories } from './upsert-system-categories';
import { upsertSystemNamedResources } from './upsert-system-named-resources';
import { upsertSystemPaymentMethods } from './upsert-system-payment-methods';

const sessionMock = {} as any;

vi.mock('@app/config', () => ({ getEnv: () => ({ ...ENV_TEST_VALUES }) }));
vi.mock('@utils/with-session', () => ({
  withSession: vi
    .fn()
    .mockImplementation(async (func, ...args) => await func(sessionMock, ...args)),
}));

describe('app setup', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('connectDB', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    const envConfigSpy = vi.spyOn(config, 'getEnv');

    it('connects to mongo and logs success', async () => {
      vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose as any);

      await connectDB();

      expect(envConfigSpy).toHaveBeenCalledOnce();
      expect(mongoose.connect).toHaveBeenCalledOnce();
      expect(mongoose.connect).toHaveBeenCalledWith(MONGO_URI_TEST);
      expect(consoleLogSpy).toHaveBeenCalledWith('MongoDB connected');
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('logs error and exits process when mongo connection fails', async () => {
      const error = new Error('db down');
      vi.spyOn(mongoose, 'connect').mockRejectedValue(error);

      await connectDB();

      expect(envConfigSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy).toHaveBeenCalledWith('MongoDB connection failed:', error);
      expect(processExitSpy).toHaveBeenCalledOnce();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('upsertSystemNamedResources', () => {
    const modelMock = { updateOne: vi.fn().mockResolvedValue({} as any) };
    const names = new Set(['name1', 'name2']);

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

  describe('upsertSystemAccounts', () => {
    it('upserts system accounts through withSession', async () => {
      const model = getNamedResourceModel('account');
      const updateOneSpy = vi.spyOn(model, 'updateOne').mockResolvedValue({} as any);

      await upsertSystemAccounts();

      expect(withSession).toHaveBeenCalledOnce();
      expect(updateOneSpy).toHaveBeenCalledTimes(SYSTEM_ACCOUNT_NAMES.size);
    });
  });

  describe('upsertSystemCategories', () => {
    it('upserts system categories through withSession', async () => {
      const model = getNamedResourceModel('category');
      const updateOneSpy = vi.spyOn(model, 'updateOne').mockResolvedValue({} as any);

      await upsertSystemCategories();

      expect(withSession).toHaveBeenCalledOnce();
      expect(updateOneSpy).toHaveBeenCalledTimes(SYSTEM_CATEGORY_NAMES.size);
    });
  });

  describe('upsertSystemPaymentMethods', () => {
    it('upserts system payment methods through withSession', async () => {
      const model = getNamedResourceModel('paymentMethod');
      const updateOneSpy = vi.spyOn(model, 'updateOne').mockResolvedValue({} as any);

      await upsertSystemPaymentMethods();

      expect(withSession).toHaveBeenCalledOnce();
      expect(updateOneSpy).toHaveBeenCalledTimes(SYSTEM_PAYMENT_METHOD_NAMES.size);
    });
  });
});
