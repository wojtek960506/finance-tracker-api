import Fastify from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import { sportCategoryRoutes } from './sport-category-routes';
import { sportEntryRoutes } from './sport-entry-routes';
import { sportRoutes } from './sport-routes';
import { sportSpendingRoutes } from './sport-spending-routes';
import { sportStatsRoutes } from './sport-stats-routes';

vi.mock('./sport-category-routes', () => ({
  sportCategoryRoutes: vi.fn(),
}));

vi.mock('./sport-entry-routes', () => ({
  sportEntryRoutes: vi.fn(),
}));

vi.mock('./sport-spending-routes', () => ({
  sportSpendingRoutes: vi.fn(),
}));

vi.mock('./sport-stats-routes', () => ({
  sportStatsRoutes: vi.fn(),
}));

describe('sportRoutes', () => {
  it('registers all sub-routes in proper order', async () => {
    const app = Fastify();
    const registerSpy = vi.spyOn(app, 'register');

    await sportRoutes(app as any);

    expect(registerSpy).toHaveBeenCalledWith(sportCategoryRoutes, {
      prefix: '/categories',
    });
    expect(registerSpy).toHaveBeenCalledWith(sportStatsRoutes, {
      prefix: '/stats',
    });
    expect(registerSpy).toHaveBeenCalledWith(sportSpendingRoutes);
    expect(registerSpy).toHaveBeenCalledWith(sportEntryRoutes);
  });
});
