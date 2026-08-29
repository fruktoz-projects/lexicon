import { buildApp } from './app';
import { env } from './config/env';

async function start() {
  try {
    const app = await buildApp();
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 Lexicon API running on http://${env.HOST}:${env.PORT}`);
    console.log(`📚 Swagger documentation available on http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    console.error('Fatal error starting Lexicon API:', err);
    process.exit(1);
  }
}

start();
