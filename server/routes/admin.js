import express from 'express';
import { dbGet, dbAll, dbRun } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}

router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await dbAll(
      `SELECT id, email, name, status, createdAt FROM users ORDER BY createdAt DESC`,
      []
    );

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Ban user
router.put('/users/:id/ban', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await dbGet(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    await dbRun(
      `UPDATE users SET status = ? WHERE id = ?`,
      [newStatus, userId]
    );

    res.json({ message: `User ${newStatus === 'banned' ? 'banned' : 'unbanned'}`, status: newStatus });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await dbGet(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete related data
    await dbRun(`DELETE FROM notes WHERE userId = ?`, [userId]);
    await dbRun(`DELETE FROM note_requests WHERE requesterId = ? OR ownerId = ?`, [userId, userId]);
    await dbRun(`DELETE FROM users WHERE id = ?`, [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await dbGet(
      `SELECT COUNT(*) as count FROM users`,
      []
    );
    const activeUsers = await dbGet(
      `SELECT COUNT(*) as count FROM users WHERE status = 'active'`,
      []
    );
    const bannedUsers = await dbGet(
      `SELECT COUNT(*) as count FROM users WHERE status = 'banned'`,
      []
    );
    const totalNotes = await dbGet(
      `SELECT COUNT(*) as count FROM notes`,
      []
    );
    const publishedNotes = await dbGet(
      `SELECT COUNT(*) as count FROM notes WHERE status = 'published'`,
      []
    );
    const totalRequests = await dbGet(
      `SELECT COUNT(*) as count FROM note_requests`,
      []
    );
    const pendingRequests = await dbGet(
      `SELECT COUNT(*) as count FROM note_requests WHERE status = 'pending'`,
      []
    );

    res.json({
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      bannedUsers: bannedUsers.count,
      totalNotes: totalNotes.count,
      publishedNotes: publishedNotes.count,
      totalRequests: totalRequests.count,
      pendingRequests: pendingRequests.count
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
