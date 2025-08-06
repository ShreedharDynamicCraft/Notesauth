import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { userService } from '../services/userService';
import type { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await userService.getUserById(req.auth!.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      provider: user.provider,
      lastSignedIn: user.lastSignedIn,
      notesCount: user.notes.length,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
