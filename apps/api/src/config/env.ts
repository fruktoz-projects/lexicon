import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3021').transform((v) => parseInt(v, 10)),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://lexicon:lexicon_password@localhost:5432/lexicon_db?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default('expedition_super_secret_jwt_key_2026'),
  GEMINI_API_KEY: z.string().optional().default(''),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  GEMINI_PRIMARY_MODEL: z.string().default('gemini-3.5-flash-lite'),
  GEMINI_FALLBACK_MODEL: z.string().default('gemini-3.1-flash-lite'),
});

export const env = envSchema.parse(process.env);
