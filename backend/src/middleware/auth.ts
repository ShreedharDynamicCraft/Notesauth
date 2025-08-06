import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

interface ClerkUserData {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: Array<{
    id: string;
    email_address: string;
  }>;
  primary_email_address_id: string;
  image_url: string;
  profile_image_url: string;
}

const fetchClerkUserData = async (userId: string): Promise<ClerkUserData | null> => {
  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch user from Clerk:', response.status);
      return null;
    }

    const userData = await response.json() as ClerkUserData;
    return userData;
  } catch (error) {
    console.error('Error fetching user data from Clerk:', error);
    return null;
  }
};

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Token received, verifying...');
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload sub:', payload.sub);
    
    if (!payload.sub) {
      console.log('Invalid token structure - no sub field');
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    // Fetch user data from Clerk API to get proper email and name
    const clerkUserData = await fetchClerkUserData(payload.sub);
// console.log('Clerk user data:', JSON.stringify(clerkUserData, null, 2));
    
    if (!clerkUserData) {
      console.log('Failed to fetch user data from Clerk');
      return res.status(401).json({ error: 'Failed to verify user' });
    }

    // Extract proper email and name from Clerk data
    const primaryEmail = clerkUserData.email_addresses?.find((email: any) => email.id === clerkUserData.primary_email_address_id);
    const email = primaryEmail?.email_address || clerkUserData.email_addresses?.[0]?.email_address;
    
    const fullName = clerkUserData.first_name && clerkUserData.last_name 
      ? `${clerkUserData.first_name} ${clerkUserData.last_name}`.trim()
      : clerkUserData.first_name || clerkUserData.last_name || '';

    console.log('Checking if user exists...');
    
    // Check if user already exists to prevent race conditions
    const existingUserByEmail = await userService.getUserByEmail(email || `${payload.sub}@no-email.com`);
    const existingUserById = await userService.getUserById(payload.sub);
    
    if (existingUserByEmail || existingUserById) {
      console.log('User already exists, proceeding with authentication:', email);
      req.auth = { userId: payload.sub };
      next();
      return;
    }
    
    // If no user exists, create one automatically during authentication
    console.log('No existing user found, creating new user...');
    try {
      const newUser = await userService.createOrUpdateUser({
        id: payload.sub,
        email: email || `${payload.sub}@no-email.com`,
        name: fullName,
        firstName: clerkUserData.first_name || undefined,
        lastName: clerkUserData.last_name || undefined,
        imageUrl: clerkUserData.image_url || undefined,
        provider: 'oauth_google',
        providerId: (clerkUserData as any).external_accounts?.[0]?.provider_user_id || payload.sub
      });
      
      console.log('User created/updated successfully with proper email and name');
      req.auth = { userId: payload.sub };
      next();
    } catch (createError) {
      console.error('Error creating user:', createError);
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export type { AuthenticatedRequest };
