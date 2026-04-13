// ---------------------------------------------------------
// Structured logger utility
// ---------------------------------------------------------

import { env } from '../config/env.config';

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG,
};

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = LOG_LEVEL_MAP[env.logLevel] ?? LogLevel.INFO;
  }

  private formatMessage(level: string, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  error(message: string, meta?: unknown): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  warn(message: string, meta?: unknown): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  info(message: string, meta?: unknown): void {
    if (this.level >= LogLevel.INFO) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  debug(message: string, meta?: unknown): void {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();
