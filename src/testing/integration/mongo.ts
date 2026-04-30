import mongoose from 'mongoose';

const DEFAULT_INTEGRATION_MONGO_URI =
  'mongodb://127.0.0.1:27018/finance-tracker-test?replicaSet=rs0';

const DEFAULT_JWT_ACCESS_SECRET = 'integration-test-jwt-secret';
const DEFAULT_COOKIE_SECRET = 'integration-test-cookie-secret';

export const getIntegrationMongoUri = () =>
  process.env.INTEGRATION_MONGO_URI || DEFAULT_INTEGRATION_MONGO_URI;

export const setIntegrationTestEnv = () => {
  process.env.NODE_ENV ??= 'test';
  process.env.MONGO_URI ??= getIntegrationMongoUri();
  process.env.JWT_ACCESS_SECRET ??= DEFAULT_JWT_ACCESS_SECRET;
  process.env.COOKIE_SECRET ??= DEFAULT_COOKIE_SECRET;
};

export const connectIntegrationMongo = async () => {
  setIntegrationTestEnv();

  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(getIntegrationMongoUri());
};

export const clearIntegrationMongo = async () => {
  if (!mongoose.connection.db) return;

  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
};

export const disconnectIntegrationMongo = async () => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
};
