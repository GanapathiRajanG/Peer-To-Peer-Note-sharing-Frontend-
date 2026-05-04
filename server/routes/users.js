import express from 'express';
import { dbGet, dbAll, dbRun } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get profile (auth required)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await dbGet(
      `SELECT id, email, name, bio, interests, createdAt, isAdmin FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      ...user,
      isAdmin: user.isAdmin === 1
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile (auth required)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, bio, interests } = req.body;

    await dbRun(
      `UPDATE users SET name = ?, bio = ?, interests = ? WHERE id = ?`,
      [name || '', bio || '', interests || '', userId]
    );

    const user = await dbGet(
      `SELECT id, email, name, bio, interests, createdAt, isAdmin FROM users WHERE id = ?`,
      [userId]
    );

    res.json({
      ...user,
      isAdmin: user.isAdmin === 1
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all users (for sharing - no auth required)
router.get('/', async (req, res) => {
  try {
    const users = await dbAll(
      `SELECT id, email, name, bio FROM users WHERE status = 'active' ORDER BY name`,
      []
    );

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by id (no auth required)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await dbGet(
      `SELECT id, email, name, bio, interests, createdAt FROM users WHERE id = ? AND status = 'active'`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
