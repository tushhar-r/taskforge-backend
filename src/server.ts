// ---------------------------------------------------------
// Application entry point – connects to DB and starts HTTP
// ---------------------------------------------------------

import app from './app';
import { env, connectDatabase, disconnectDatabase } from './config';
import { logger } from './utils';

async function bootstrap(): Promise<void> {
  // 1. Connect to MongoDB
  await connectDatabase();

  // 2. Start HTTP server
  const server = app.listen(env.port, '0.0.0.0', () => {
    logger.info(`🚀 Server running on port ${env.port} [${env.nodeEnv}]`);
    logger.info(`📋 Health check: http://localhost:${env.port}/api/health`);
  });
  // ─── Graceful Shutdown ────────────────────────────────

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Shutting down gracefully…`);

    server.close(async () => {
      await disconnectDatabase();
      logger.info('Process terminated');
      process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown stalls
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ─── Unhandled Errors ─────────────────────────────────

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});
