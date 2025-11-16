import Fastify from "fastify";
import dotenv from "dotenv";
import { connectDB } from "@utils/db";
import { transactionRoutes } from "@routes/transactions";
import { registerErrorHandler } from "./plugins/errorHandler";
import cors from "@fastify/cors"
import { userRoutes } from "@routes/user";

dotenv.config();
const PORT = Number(process.env.PORT) || 5000;

const buildApp = async () => {
  const app = Fastify({ logger: true });
  app.register(transactionRoutes, { prefix: "/api/transactions" });
  app.register(userRoutes, { prefix: "/api/users" })
  await registerErrorHandler(app);

  // Register CORS
  await app.register(cors, {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  })

  return app;
}

const start = async () => {
  await connectDB();
  const app = await buildApp();
  try {
    await app.listen({ port: PORT });
    console.log(`Server running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();