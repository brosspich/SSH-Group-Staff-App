import { env } from './env.js';

export const databaseConfig = {
  url: env.DATABASE_URL,
  isProduction: env.NODE_ENV === 'production',
};
