import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import Fastify from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { accountRoutes } from '@account/routes';
import { getEnv } from '@app/config';
import { mainRoutes } from '@app/routes';
import {
  connectDB,
  upsertSystemAccounts,
  upsertSystemCategories,
  upsertSystemPaymentMethods,
} from '@app/setup';
import { authRoutes } from '@auth/routes';
import { categoryRoutes } from '@category/routes';
import { paymentMethodRoutes } from '@payment-method/routes';
import { transactionRoutes } from '@transaction/routes';
import { userRoutes } from '@user/routes';

import { registerErrorHandler } from './plugins/errorHandler';

//############################################################################################
// TODOS                                                                                     #
// * revisit `user-routes` logic because maybe it is too complicated for now                 #
//   and sometimes I do not understand why I am logged out due to problem with tokens        #
// * write some logic to update all transactions in other currencies with exchange rate      #
//   from the day of given transaction - from server perspective I need to write some        #
//   script to do it on the whole old data from spreadsheets                                 #
// * when adding old transactions from CSV file I need to update the exchange                #
//   transactions to have real IDs as references (FastAPI)                                   #
//############################################################################################

export const buildApp = async (env = getEnv()) => {
  const { cookieSecret, jwtAccessSecret } = env;

  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // upsert system categories
  await upsertSystemAccounts();
  await upsertSystemCategories();
  await upsertSystemPaymentMethods();

  // register cookie
  await app.register(cookie, {
    secret: cookieSecret,
    parseOptions: {},
  });

  // register jwt
  await app.register(fastifyJwt, {
    secret: jwtAccessSecret,
  });

  // register Swagger (OpenAPI spec generation)
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Finance Tracker API',
        description: 'Documentation for API of Finance Tracker',
        version: '1.0.0'
      }
    },
    transform: jsonSchemaTransform,
  });

  // register Swagger UI
  await app.register(swaggerUI, { routePrefix: '/docs' });

  // register routes
  await app.register(mainRoutes, { prefix: '' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(accountRoutes, { prefix: '/api/accounts' });
  await app.register(categoryRoutes, { prefix: '/api/categories' });
  await app.register(paymentMethodRoutes, { prefix: '/api/paymentMethods' });
  await app.register(transactionRoutes, { prefix: '/api/transactions' });

  // register error handler
  await registerErrorHandler(app);

  // register CORS
  await app.register(cors, {
    origin: [
      'http://localhost:3000',
      'http://192.168.0.244:3000',
      'http://localhost:5173',
      'https://finance-tracker-web-three.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  

  return app;
};

export const start = async () => {
  await connectDB();
  const env = getEnv();
  const app = await buildApp(env);
  try {
    const { port } = env;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
