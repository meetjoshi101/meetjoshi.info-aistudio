import { Request, Response } from 'express';

// Mock Express Request
export function mockRequest(overrides: any = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides
  } as Request;
}

// Mock Express Response
export function mockResponse(): Response {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis()
  };
  return res as Response;
}

// Mock Next Function
export function mockNext() {
  return jest.fn();
}
