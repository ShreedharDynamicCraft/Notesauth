import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/clerk-sdk-node';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
      issuer: `https://clerk.${process.env.CLERK_DOMAIN || 'clerk.dev'}`
    });

    req.auth = { userId: payload.sub };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export type { AuthenticatedRequest };
