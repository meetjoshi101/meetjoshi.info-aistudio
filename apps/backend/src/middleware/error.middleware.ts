import { Request, Response, NextFunction } from 'express';

/**
 * Express error-handling middleware that logs the error and sends a JSON response containing an HTTP status, error message, and an optional stack trace.
 *
 * @param err - Error-like object; uses `err.status` for the response status (defaults to 500), `err.message` for the error text (defaults to "Internal server error"), and includes `err.stack` in the response only when NODE_ENV is "development".
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}