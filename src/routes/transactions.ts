import { FastifyInstance } from "fastify";
import { Transaction } from "@models/Transaction";

export async function transactionRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return await Transaction.find().sort({ date: -1 });
  });

  app.post("/", async (req, res) => {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.code(201).send(transaction);
  });
}