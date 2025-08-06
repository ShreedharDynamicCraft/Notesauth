import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';

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

    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (!payload.sub) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    await userService.createOrUpdateUser({
      id: payload.sub,
      email: payload.email || `${payload.sub}@clerk.local`,
      name: payload.name,
      firstName: payload.first_name,
      lastName: payload.last_name,
      imageUrl: payload.image_url,
      provider: payload.oauth_provider,
      providerId: payload.oauth_provider_id,
    });
    
    req.auth = { userId: payload.sub };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export type { AuthenticatedRequest };
