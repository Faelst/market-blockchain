import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/errors';
import { logger } from '../utils/logger';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ 
    success: false,
    error: 'Not found',
    code: 'NOT_FOUND'
  });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  if (err instanceof HttpError) {
    return res.status(err.status).json(err.toJSON());
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.message,
    });
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists',
      code: 'DUPLICATE_KEY',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    code: 'INTERNAL_ERROR',
  });
}