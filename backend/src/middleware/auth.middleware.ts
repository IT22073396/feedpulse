import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: { email: string };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendResponse(res, 401, null, 'No token provided', 'Unauthorised');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { email: string };

    req.user = decoded;
    next();
  } catch {
    sendResponse(res, 401, null, 'Invalid or expired token', 'Unauthorised');
  }
}