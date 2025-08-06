import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    const userId = req.auth!.userId;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    await ensureUserExists(userId);

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId
      }
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth!.userId;
    
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.auth!.userId;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const existingNote = await prisma.note.findFirst({
      where: { id, userId }
    });
    
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title, content }
    });

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth!.userId;
    
    const note = await prisma.note.findFirst({
      where: { id, userId }
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await prisma.note.delete({
      where: { id }
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const ensureUserExists = async (userId: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@clerk.dev`
      }
    });
  }
};
