import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

import { buildApp } from '../src/app/app.js';
import { getEnv } from '../src/app/config/index.js';
import type { EnvType } from '../src/app/config/env.js';

dotenv.config();

const getExportEnv = (): EnvType => {
  try {
    return getEnv();
  } catch {
    // If environment variables are missing, construct a safe fallback EnvType for schema export
    return {
      appOrigin: 'http://localhost:5173',
      port: 3000,
      nodeEnv: 'development',
      mongoUri: 'mongodb://localhost:27017/dummy-db',
      corsOrigins: ['http://localhost:5173'],
      corsOriginPatterns: [],
      cookieSecret: 'export-openapi-dummy-cookie-secret',
      jwtAccessSecret: 'export-openapi-dummy-jwt-secret',
      jwtAccessExpiresIn: '15m',
      jwtRefreshExpiresDays: 7,
      emailVerificationExpiresHours: 24,
    };
  }
};

async function exportOpenApi() {
  const env = getExportEnv();
  const app = await buildApp(env, { skipDbSetup: true });
  await app.ready();

  const openapiSpec = app.swagger();
  const outputPath = path.resolve(process.cwd(), 'openapi.json');

  fs.writeFileSync(outputPath, JSON.stringify(openapiSpec, null, 2));
  console.log(`OpenAPI specification successfully exported to ${outputPath}`);
  process.exit(0);
}

exportOpenApi().catch((err) => {
  console.error('Failed to export OpenAPI spec:', err);
  process.exit(1);
});
