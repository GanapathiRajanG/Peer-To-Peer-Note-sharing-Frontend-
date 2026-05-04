import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbGet, dbAll, dbRun } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Request a note share
router.post('/request', async (req, res) => {
  try {
    const { ownerId, noteId } = req.body;
    const requesterId = req.user.userId;

    if (!ownerId || !noteId) {
      return res.status(400).json({ error: 'ownerId and noteId are required' });
    }

    // Check if note exists and belongs to owner
    const note = await dbGet(
      `SELECT * FROM notes WHERE id = ? AND userId = ?`,
      [noteId, ownerId]
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if request already exists
    const existing = await dbGet(
      `SELECT * FROM note_requests WHERE noteId = ? AND requesterId = ? AND ownerId = ? AND status = 'pending'`,
      [noteId, requesterId, ownerId]
    );

    if (existing) {
      return res.status(400).json({ error: 'Request already exists' });
    }

    const requestId = uuidv4();
    const createdAt = new Date().toISOString();

    await dbRun(
      `INSERT INTO note_requests (id, requesterId, ownerId, noteId, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      [requestId, requesterId, ownerId, noteId, 'pending', createdAt]
    );

    res.status(201).json({
      id: requestId,
      requesterId,
      ownerId,
      noteId,
      status: 'pending',
      createdAt
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Get pending requests for user
router.get('/requests', async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await dbAll(
      `SELECT 
        r.id,
        r.requesterId,
        r.noteId,
        r.status,
        r.createdAt,
        u.email,
        u.name,
        n.title as notesTitle
      FROM note_requests r
      JOIN users u ON r.requesterId = u.id
      JOIN notes n ON r.noteId = n.id
      WHERE r.ownerId = ?
      ORDER BY r.createdAt DESC`,
      [userId]
    );

    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Accept share request
router.put('/requests/:id/accept', async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;

    const request = await dbGet(
      `SELECT * FROM note_requests WHERE id = ? AND ownerId = ?`,
      [requestId, userId]
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await dbRun(
      `UPDATE note_requests SET status = 'accepted' WHERE id = ?`,
      [requestId]
    );

    res.json({ message: 'Request accepted', status: 'accepted' });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

// Reject share request
router.put('/requests/:id/reject', async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;

    const request = await dbGet(
      `SELECT * FROM note_requests WHERE id = ? AND ownerId = ?`,
      [requestId, userId]
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await dbRun(
      `UPDATE note_requests SET status = 'rejected' WHERE id = ?`,
      [requestId]
    );

    res.json({ message: 'Request rejected', status: 'rejected' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// Get shared notes (notes shared with me)
router.get('/shared-with-me', async (req, res) => {
  try {
    const userId = req.user.userId;

    const sharedNotes = await dbAll(
      `SELECT 
        n.id,
        n.title,
        n.content,
        n.tags,
        n.createdAt,
        u.name as author,
        u.email as authorEmail
      FROM notes n
      JOIN note_requests r ON n.id = r.noteId
      JOIN users u ON n.userId = u.id
      WHERE r.requesterId = ? AND r.status = 'accepted'
      ORDER BY r.createdAt DESC`,
      [userId]
    );

    const formatted = sharedNotes.map(note => ({
      ...note,
      tags: JSON.parse(note.tags || '[]')
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching shared notes:', error);
    res.status(500).json({ error: 'Failed to fetch shared notes' });
  }
});

export default router;
