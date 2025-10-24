import Fastify from "fastify";
import dotenv from "dotenv";
import { connectDB } from "@utils/db";
import { transactionRoutes } from "@routes/transactions";

dotenv.config();

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT) || 5000;

app.register(transactionRoutes, { prefix: "/api/transactions" });

const start = async () => {
  await connectDB();
  try {
    await app.listen({ port: PORT });
    console.log(`Server running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();