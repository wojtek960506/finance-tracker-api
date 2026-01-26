import { FastifyInstance } from "fastify";

export async function mainRoute(app: FastifyInstance) {
  app.get('/', async (_req, res) => {
    return res.code(200).send({ "message": "Welcome in the API for Finance Tracker" })
  })
}