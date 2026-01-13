import { Request, Response } from 'express';
import { supabaseClient } from '../config/supabase.js';
import { SignInRequest } from '@meetjoshi/shared';

export class AuthController {
  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as SignInRequest;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        res.status(401).json({ error: error.message });
        return;
      }

      res.json({
        user: data.user ? {
          id: data.user.id,
          email: data.user.email
        } : null,
        session: data.session ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at || 0
        } : null
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async signOut(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(200).json({ success: true });
        return;
      }

      const token = authHeader.substring(7);

      await supabaseClient.auth.admin.signOut(token);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Sign out error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ session: null });
        return;
      }

      const token = authHeader.substring(7);

      const { data: { user }, error } = await supabaseClient.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({ session: null });
        return;
      }

      res.json({
        session: {
          user: {
            id: user.id,
            email: user.email
          }
        }
      });
    } catch (error: any) {
      console.error('Get session error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
