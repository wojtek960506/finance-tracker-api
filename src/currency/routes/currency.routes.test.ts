
import { USER_ID_STR } from "@testing/factories/general";
import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { describe, expect, it, vi } from "vitest";

import { registerErrorHandler } from "@app/plugins/errorHandler";
import { currencyRoutes } from "@currency/routes";

const mockPrehandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({ authorizeAccessToken: vi.fn(() => mockPrehandler) }));

describe('currency routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(currencyRoutes)
  await registerErrorHandler(app);

  it("should get currencies - 'GET /'", async () => {
    const response = await app.inject({ method: 'GET', url: '/' });

    expect(response.statusCode).toBe(200);
    const json = response.json();
    expect(json).toHaveLength(36);
    expect(json[0]).toEqual({ code: 'USD', name: 'US Dollar'});
  });
})
