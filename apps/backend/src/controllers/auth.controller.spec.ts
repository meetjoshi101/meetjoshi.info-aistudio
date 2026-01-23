import { AuthController } from './auth.controller';
import { mockRequest, mockResponse } from '../__tests__/test-utils';
import { supabaseClient } from '../config/supabase';

jest.mock('../config/supabase.js');

describe('AuthController', () => {
  let authController: AuthController;
  let req: any;
  let res: any;

  beforeEach(() => {
    authController = new AuthController();
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should return 400 if email is missing', async () => {
      req.body = { password: 'test123' };

      await authController.signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email and password are required'
      });
    });

    it('should return 400 if password is missing', async () => {
      req.body = { email: 'test@example.com' };

      await authController.signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email and password are required'
      });
    });

    it('should return 401 if credentials are invalid', async () => {
      req.body = { email: 'test@example.com', password: 'wrong' };

      (supabaseClient.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      });

      await authController.signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });

    it('should return user and session on successful sign in', async () => {
      req.body = { email: 'test@example.com', password: 'test123' };

      const mockUser = {
        id: '123',
        email: 'test@example.com'
      };

      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_at: 1234567890
      };

      (supabaseClient.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      await authController.signIn(req, res);

      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: '123',
          email: 'test@example.com'
        },
        session: {
          access_token: 'token123',
          refresh_token: 'refresh123',
          expires_at: 1234567890
        }
      });
    });

    it('should handle errors gracefully', async () => {
      req.body = { email: 'test@example.com', password: 'test123' };

      (supabaseClient.auth.signInWithPassword as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await authController.signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('signOut', () => {
    it('should return success if no authorization header', async () => {
      req.headers = {};

      await authController.signOut(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return success if authorization header is invalid', async () => {
      req.headers = { authorization: 'Invalid' };

      await authController.signOut(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should sign out user with valid token', async () => {
      req.headers = { authorization: 'Bearer token123' };

      (supabaseClient.auth.admin.signOut as jest.Mock).mockResolvedValue({
        error: null
      });

      await authController.signOut(req, res);

      expect(supabaseClient.auth.admin.signOut).toHaveBeenCalledWith('token123');
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should handle errors gracefully', async () => {
      req.headers = { authorization: 'Bearer token123' };

      (supabaseClient.auth.admin.signOut as jest.Mock).mockRejectedValue(
        new Error('Sign out error')
      );

      await authController.signOut(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('getSession', () => {
    it('should return 401 if no authorization header', async () => {
      req.headers = {};

      await authController.getSession(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ session: null });
    });

    it('should return 401 if authorization header is invalid', async () => {
      req.headers = { authorization: 'Invalid' };

      await authController.getSession(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ session: null });
    });

    it('should return 401 if token is invalid', async () => {
      req.headers = { authorization: 'Bearer invalid_token' };

      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      await authController.getSession(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ session: null });
    });

    it('should return session for valid token', async () => {
      req.headers = { authorization: 'Bearer valid_token' };

      const mockUser = {
        id: '123',
        email: 'test@example.com'
      };

      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      await authController.getSession(req, res);

      expect(res.json).toHaveBeenCalledWith({
        session: {
          user: {
            id: '123',
            email: 'test@example.com'
          }
        }
      });
    });

    it('should handle errors gracefully', async () => {
      req.headers = { authorization: 'Bearer token123' };

      (supabaseClient.auth.getUser as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await authController.getSession(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });
});
