import express from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { dbGet, dbRun } from '../database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';

function generateToken(userId, email, isAdmin) {
  return jwt.sign({ userId, email, isAdmin }, JWT_SECRET, { expiresIn: '7d' });
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = uuidv4();
    const createdAt = new Date().toISOString();
    
    await dbRun(
      `INSERT INTO users (id, email, password, name, createdAt, isAdmin, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, email, hashedPassword, name || email, createdAt, 0, 'active']
    );

    const token = generateToken(userId, email, false);
    res.status(201).json({ 
      message: 'Registration successful',
      token,
      user: { id: userId, email, name: name || email, isAdmin: false }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is banned
    if (user.status === 'banned') {
      return res.status(403).json({ error: 'Account is banned' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email, user.isAdmin === 1);
    res.json({ 
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        isAdmin: user.isAdmin === 1
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
