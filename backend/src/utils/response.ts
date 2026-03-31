import { Response } from 'express';

export const sendResponse = <T>(
  res: Response,
  status: number,
  data: T | null,
  message: string,
  error?: string
): void => {
  res.status(status).json({
    success: status < 400,
    data: data ?? null,
    error: error ?? null,
    message,
  });
};