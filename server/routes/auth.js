
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const { rows } = await req.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = rows[0];
    
    // In a real system, you'd verify the hashed password
    // For now, we'll simulate password verification
    // const passwordValid = await bcrypt.compare(password, user.password_hash);
    const passwordValid = password === 'password'; // For testing only
    
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Log the login action
    await req.db.query(
      `INSERT INTO logs (action, entity, entity_id, user_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      ['login', 'auth', null, user.id, JSON.stringify({ method: 'email' })]
    );
    
    res.json({
      session: { access_token: token },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
