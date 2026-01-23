import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './config/cors.js';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

/**
 * Create and configure an Express application with security, logging, body parsing, routes, a root info endpoint, and centralized error handling.
 *
 * @returns An Express application instance configured with Helmet security headers, CORS (using configured options), morgan request logging, JSON and URL-encoded body parsing (10 MB limit), API routes mounted at `/api`, a root `GET /` endpoint returning basic metadata, and the centralized error handler registered last.
 */
export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors(corsOptions));

  // Logging
  app.use(morgan('combined'));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API routes
  app.use('/api', routes);

  // Root route
  app.get('/', (req, res) => {
    res.json({
      name: 'Meet Joshi Portfolio API',
      version: '1.0.0',
      docs: '/api/health'
    });
  });

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}