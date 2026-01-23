import { authMiddleware, AuthRequest } from './auth.middleware';
import { mockRequest, mockResponse, mockNext } from '../__tests__/test-utils';
import { supabaseClient } from '../config/supabase';

jest.mock('../config/supabase.js');

describe('authMiddleware', () => {
  let req: AuthRequest;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = mockRequest() as AuthRequest;
    res = mockResponse();
    next = mockNext();
    jest.clearAllMocks();
  });

  it('should return 401 if no authorization header is present', async () => {
    req.headers = {};

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized: No token provided'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with Bearer', async () => {
    req.headers = { authorization: 'InvalidToken' };

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized: No token provided'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    req.headers = { authorization: 'Bearer invalid_token' };

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' }
    });

    await authMiddleware(req, res, next);

    expect(supabaseClient.auth.getUser).toHaveBeenCalledWith('invalid_token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized: Invalid token'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not found', async () => {
    req.headers = { authorization: 'Bearer valid_token' };

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null
    });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized: Invalid token'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach user to request and call next on valid token', async () => {
    req.headers = { authorization: 'Bearer valid_token' };

    const mockUser = {
      id: '123',
      email: 'test@example.com'
    };

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    await authMiddleware(req, res, next);

    expect(supabaseClient.auth.getUser).toHaveBeenCalledWith('valid_token');
    expect(req.user).toEqual({
      id: '123',
      email: 'test@example.com'
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle user with null email', async () => {
    req.headers = { authorization: 'Bearer valid_token' };

    const mockUser = {
      id: '123',
      email: null
    };

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    await authMiddleware(req, res, next);

    expect(req.user).toEqual({
      id: '123',
      email: ''
    });
    expect(next).toHaveBeenCalled();
  });

  it('should return 500 on unexpected error', async () => {
    req.headers = { authorization: 'Bearer valid_token' };

    (supabaseClient.auth.getUser as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should extract token correctly from Bearer prefix', async () => {
    req.headers = { authorization: 'Bearer mytoken123' };

    const mockUser = {
      id: 'user1',
      email: 'user@example.com'
    };

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    await authMiddleware(req, res, next);

    expect(supabaseClient.auth.getUser).toHaveBeenCalledWith('mytoken123');
    expect(next).toHaveBeenCalled();
  });
});
