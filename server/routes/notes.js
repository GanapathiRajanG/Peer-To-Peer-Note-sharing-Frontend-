import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbGet, dbAll, dbRun } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Create note
router.post('/', async (req, res) => {
  try {
    const { title, content, tags = [], status = 'draft' } = req.body;
    const userId = req.user.userId;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const noteId = uuidv4();
    const now = new Date().toISOString();
    const tagsStr = JSON.stringify(tags);

    await dbRun(
      `INSERT INTO notes (id, userId, title, content, tags, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [noteId, userId, title, content || '', tagsStr, status, now, now]
    );

    res.status(201).json({
      id: noteId,
      title,
      content,
      tags,
      status,
      createdAt: now,
      updatedAt: now
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Get user's notes
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const notes = await dbAll(
      `SELECT id, title, content, tags, status, createdAt, updatedAt
       FROM notes
       WHERE userId = ?
       ORDER BY updatedAt DESC`,
      [userId]
    );

    const formatted = notes.map(note => ({
      ...note,
      tags: JSON.parse(note.tags || '[]')
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note
router.get('/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;

    const note = await dbGet(
      `SELECT * FROM notes WHERE id = ? AND userId = ?`,
      [noteId, userId]
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      ...note,
      tags: JSON.parse(note.tags || '[]')
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;
    const { title, content, tags = [], status } = req.body;

    const note = await dbGet(
      `SELECT * FROM notes WHERE id = ? AND userId = ?`,
      [noteId, userId]
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const now = new Date().toISOString();
    const tagsStr = JSON.stringify(tags);

    await dbRun(
      `UPDATE notes SET title = ?, content = ?, tags = ?, status = ?, updatedAt = ? WHERE id = ?`,
      [title || note.title, content !== undefined ? content : note.content, tagsStr, status || note.status, now, noteId]
    );

    res.json({
      id: noteId,
      title: title || note.title,
      content: content !== undefined ? content : note.content,
      tags,
      status: status || note.status,
      createdAt: note.createdAt,
      updatedAt: now
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;

    const note = await dbGet(
      `SELECT * FROM notes WHERE id = ? AND userId = ?`,
      [noteId, userId]
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await dbRun('DELETE FROM notes WHERE id = ?', [noteId]);
    await dbRun('DELETE FROM note_shares WHERE noteId = ?', [noteId]);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Publish note
router.put('/:id/publish', async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;

    const note = await dbGet(
      `SELECT * FROM notes WHERE id = ? AND userId = ?`,
      [noteId, userId]
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const now = new Date().toISOString();
    await dbRun(`UPDATE notes SET status = 'published', updatedAt = ? WHERE id = ?`, [now, noteId]);

    res.json({ message: 'Note published successfully', status: 'published' });
  } catch (error) {
    console.error('Error publishing note:', error);
    res.status(500).json({ error: 'Failed to publish note' });
  }
});

export default router;
