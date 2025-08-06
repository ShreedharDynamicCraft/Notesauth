const express = require('express');
const Note = require('../models/Note');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateUser, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const note = new Note({
      title,
      content,
      userId: req.userId
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticateUser, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT route for updating notes (including adding images)
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update the note with new data
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { 
        title: title || note.title,
        content: content || note.content,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json(updatedNote);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
