import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './config/cors.js';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

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
