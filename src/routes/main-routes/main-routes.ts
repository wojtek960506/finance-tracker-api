import { FastifyInstance } from "fastify";
import { WELCOME_MESSAGE } from "./consts";


export async function mainRoutes(app: FastifyInstance) {
  app.get('/', async (_req, res) => {
    return res.code(200).send({ "message": WELCOME_MESSAGE })
  });
}
