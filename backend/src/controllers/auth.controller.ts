import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/response';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      sendResponse(res, 400, null, 'Email and password required', 'Bad request');
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@feedpulse.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email !== adminEmail || password !== adminPassword) {
      sendResponse(res, 401, null, 'Invalid credentials', 'Unauthorised');
      return;
    }

    const token = jwt.sign(
      { email: adminEmail },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    sendResponse(res, 200, { token }, 'Login successful');
  } catch (err) {
    sendResponse(res, 500, null, 'Internal server error', 'Server error');
  }
}