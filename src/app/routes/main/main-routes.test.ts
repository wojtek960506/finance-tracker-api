import Fastify from "fastify";
import { mainRoutes } from "./main-routes";
import { WELCOME_MESSAGE } from "./consts";
import { describe, expect, it } from "vitest";


describe("category routes", async () => {

  const app = Fastify();
  app.register(mainRoutes);

  it("should get welcome message - 'GET /'", async () => {
    const response = await app.inject({ method: "GET", url: "/" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ "message": WELCOME_MESSAGE });
  });
});
