import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import r from '../config/database.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Try to find in managers table first
    let user = await r.table('managers')
      .filter({ username })
      .nth(0)
      .default(null)
      .run();

    let role = 'manager';

    // If not found in managers, try cashiers table
    if (!user) {
      user = await r.table('cashiers')
        .filter({ username })
        .nth(0)
        .default(null)
        .run();
      
      role = 'cashier';
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: role,
        fullName: user.fullName 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;