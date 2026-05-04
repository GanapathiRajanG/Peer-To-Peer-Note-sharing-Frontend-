import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database.js';
import { authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import usersRoutes from './routes/users.js';
import sharesRoutes from './routes/shares.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Auth routes (no auth required)
app.use('/api/auth', authRoutes);

// Notes routes (auth required)
app.use('/api/notes', authenticateToken, notesRoutes);

// Users routes
app.use('/api/users', usersRoutes);

// Shares routes (auth required)
app.use('/api/shares', authenticateToken, sharesRoutes);

// Admin routes (auth + admin required)
app.use('/api/admin', authenticateToken, adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
