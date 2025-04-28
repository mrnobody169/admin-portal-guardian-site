
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get all logs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await req.db.query(
      'SELECT * FROM logs ORDER BY created_at DESC'
    );
    res.json({ logs: rows });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Create a new log entry
router.post('/', authenticateToken, async (req, res) => {
  const { action, entity, entity_id, user_id, details } = req.body;
  
  try {
    const { rows } = await req.db.query(
      `INSERT INTO logs (action, entity, entity_id, user_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [action, entity, entity_id, user_id || req.user?.id, details]
    );
    
    res.status(201).json({ log: rows[0] });
  } catch (error) {
    console.error('Error creating log entry:', error);
    res.status(500).json({ error: 'Failed to create log entry' });
  }
});

module.exports = router;
