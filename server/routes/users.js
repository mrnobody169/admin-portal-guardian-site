
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await req.db.query('SELECT * FROM users');
    res.json({ users: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await req.db.query(
      'SELECT * FROM users WHERE id = $1',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/', authenticateToken, async (req, res) => {
  const { email, name, role } = req.body;
  
  try {
    // Check if email already exists
    const existingUser = await req.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Insert new user
    const { rows } = await req.db.query(
      `INSERT INTO users (email, name, role, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [email, name, role || 'user']
    );
    
    // Log the action
    await req.db.query(
      `INSERT INTO logs (action, entity, entity_id, user_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      ['create', 'users', rows[0].id, req.user?.id, JSON.stringify({ name, email })]
    );
    
    res.status(201).json({ user: rows[0] });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  const { email, name, role } = req.body;
  
  try {
    const { rows } = await req.db.query(
      `UPDATE users 
       SET email = $1, name = $2, role = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [email, name, role, req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Log the action
    await req.db.query(
      `INSERT INTO logs (action, entity, entity_id, user_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      ['update', 'users', rows[0].id, req.user?.id, JSON.stringify(req.body)]
    );
    
    res.json({ user: rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Get user before deletion
    const userResult = await req.db.query(
      'SELECT * FROM users WHERE id = $1',
      [req.params.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete the user
    await req.db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    
    // Log the action
    await req.db.query(
      `INSERT INTO logs (action, entity, entity_id, user_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'delete', 
        'users', 
        req.params.id, 
        req.user?.id, 
        JSON.stringify({ deletedUser: userResult.rows[0].email })
      ]
    );
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
