import dotenv from "dotenv";
import Fastify from "fastify";
import cors from "@fastify/cors"
import cookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import { connectDB } from "@utils/db";
import {
  authRoutes,
  userRoutes,
  transactionRoutes,
} from "@/routes";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { registerErrorHandler } from "./plugins/errorHandler";
import { mainRoute } from "@routes/main-route";


//############################################################################################
// TODOS                                                                                     #
// * write unit tests because there is very big lack of unit tests here                      #
// * revisit `user-routes` logic because maybe it is too complicated for now                 #
//   and sometimes I do not understand why I am logged out due to problem with tokens        #
// * write some logic to update all transactions in other currencies with exchange rate      #
//   from the day of given transaction - from server perspective I need to write some        #
//   script to do it on the whole old data from spreadsheets                                 #
// * when adding old transactions from CSV file I need to update the exchange                #
//   transactions to have real IDs as references (FastAPI)                                   #
//############################################################################################


dotenv.config();
const PORT = Number(process.env.PORT) || 5000;

const buildApp = async () => {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
  
  // register cookie
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || undefined,
    parseOptions: {},
  });
  // register jwt
  await app.register(fastifyJwt, {
    secret: process.env.JWT_ACCESS_SECRET!
  });
  
  app.register(mainRoute, { prefix: "" });
  app.register(authRoutes, { prefix: "/api/auth" });  
  app.register(userRoutes, { prefix: "/api/users" });
  app.register(transactionRoutes, { prefix: "/api/transactions" });

  await registerErrorHandler(app);

  // Register CORS
  await app.register(cors, {
    origin: [
      "http://localhost:3000",
      "https://finance-tracker-web-three.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  return app;
}

const start = async () => {
  await connectDB();
  const app = await buildApp();
  try {
    console.log('port from environment variables:', process.env.PORT);
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();