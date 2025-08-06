import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { createNote, getUserNotes, updateNote, deleteNote } from '../controllers/notesController';

const router = Router();

router.post('/', authenticateUser, createNote);
router.get('/', authenticateUser, getUserNotes);
router.put('/:id', authenticateUser, updateNote);
router.delete('/:id', authenticateUser, deleteNote);

export default router;
