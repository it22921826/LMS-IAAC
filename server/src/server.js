import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { notFoundHandler, errorHandler } from './middleware/errorHandlers.js';
import { healthRouter } from './routes/health.routes.js';
import { lmsRouter } from './routes/lms.routes.js';

export function createServer() {
  const app = express();

  const envOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const isAllowedLocalDevOrigin = (origin) => {
    try {
      const url = new URL(origin);
      const hostOk = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const portOk = /^517\d$/.test(url.port);
      return url.protocol === 'http:' && hostOk && portOk;
    } catch {
      return false;
    }
  };

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (envOrigins.length > 0) return callback(null, envOrigins.includes(origin));
        return callback(null, isAllowedLocalDevOrigin(origin));
      },
      credentials: true,
    })
  );
  app.use(morgan('dev'));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/', (req, res) => {
    res.json({ name: 'lms-api', status: 'ok' });
  });

  app.use('/api/health', healthRouter);
  app.use('/api', lmsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
