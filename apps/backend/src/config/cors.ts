import cors from 'cors';
import { config } from './environment.js';

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests from frontend or no origin (mobile apps, Postman, etc.)
    const allowedOrigins = [
      config.frontend.url,
      'http://localhost:3000',
      'http://localhost:4200',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
