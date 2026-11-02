import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .default("4000")
    .transform((v) => parseInt(v, 10)),
  DATABASE_URL: z.string().default("file:./dev.db"),
  JWT_SECRET: z.string().default("ssh-group-secret-super-key-2026"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  D1_ACCOUNT_ID: z.string().optional(),
  D1_DATABASE_ID: z.string().optional(),
  D1_DATABASE_NAME: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CORS_ORIGIN: z.string().default("*"),
});

export const env = envSchema.parse(process.env);
