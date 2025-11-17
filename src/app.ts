import Fastify from "fastify";
import dotenv from "dotenv";
import { connectDB } from "@utils/db";
import { transactionRoutes } from "@routes/transactions";
import { registerErrorHandler } from "./plugins/errorHandler";
import cors from "@fastify/cors"
import cookie from "@fastify/cookie";
import { userRoutes } from "@routes/user";
import authRoutes from "@routes/auth";
import fastifyJwt from "@fastify/jwt";

dotenv.config();
const PORT = Number(process.env.PORT) || 5000;

const buildApp = async () => {
  const app = Fastify({ logger: true });
  
  // register cookie
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || undefined,
    parseOptions: {},
  });
  // register jwt
  await app.register(fastifyJwt, {
    secret: process.env.JWT_ACCESS_SECRET!
  });
  
  app.register(authRoutes, { prefix: "/api/auth" });  
  app.register(userRoutes, { prefix: "/api/users" });
  app.register(transactionRoutes, { prefix: "/api/transactions" });

  await registerErrorHandler(app);

  // Register CORS
  await app.register(cors, {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  });

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