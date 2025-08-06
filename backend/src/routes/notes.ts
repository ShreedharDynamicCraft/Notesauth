import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { createNote, getUserNotes, deleteNote } from '../controllers/notesController';

const router = Router();

router.post('/', authenticateUser, createNote);
router.get('/', authenticateUser, getUserNotes);
router.delete('/:id', authenticateUser, deleteNote);

export default router;
