import { Request, Response, NextFunction } from 'express';
import { supabaseClient } from '../config/supabase.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Express middleware that validates a Bearer Supabase session token and attaches the authenticated user to the request.
 *
 * If the Authorization header is missing or does not contain a valid Bearer token, the middleware responds with HTTP 401.
 * If Supabase token verification fails, the middleware responds with HTTP 401. On unexpected errors it responds with HTTP 500.
 * On success the middleware sets `req.user` to an object with `id` and `email` (email will be an empty string if not provided) and calls `next()`.
 *
 * @param req - The incoming AuthRequest; on successful authentication `req.user` is populated with `{ id, email }`.
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify session token with Supabase
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email || '',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}