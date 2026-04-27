// ---------------------------------------------------------
// Express application setup
// ---------------------------------------------------------

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middlewares';
import { sendError } from './utils';
import { HttpStatus, ErrorCode, Messages } from './constants';

const app = express();

// ─── Security ───────────────────────────────────────────

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ─── Rate Limiting ──────────────────────────────────────

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Loosened for development/testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: Messages.RATE_LIMIT_EXCEEDED,
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
    },
  },
});

app.use('/api', limiter);

// ─── Body Parsing ───────────────────────────────────────

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Routes ─────────────────────────────────────────────

app.use('/api', routes);

// ─── 404 Catch-All ──────────────────────────────────────

app.use((_req, res) => {
  sendError(res, HttpStatus.NOT_FOUND, Messages.ROUTE_NOT_FOUND, ErrorCode.NOT_FOUND);
});

// ─── Centralised Error Handler ──────────────────────────

app.use(errorHandler);

export default app;
