import http from 'node:http';
import { connectDB } from './db';
import { config } from './config';
import { createApp } from './app';
import { initSockets } from './sockets';
import { logger } from './utils/logger';

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  initSockets(server);

  server.listen(config.port, '0.0.0.0', () => {
    logger.info(`API listening on http://localhost:${config.port}`);
  });
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});