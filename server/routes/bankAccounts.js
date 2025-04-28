
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get all bank accounts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await req.db.query('SELECT * FROM bank_accounts');
    res.json({ accounts: rows });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ error: 'Failed to fetch bank accounts' });
  }
});

// Get bank account by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await req.db.query(
      'SELECT * FROM bank_accounts WHERE id = $1',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    res.json({ account: rows[0] });
  } catch (error) {
    console.error('Error fetching bank account:', error);
    res.status(500).json({ error: 'Failed to fetch bank account' });
  }
});

// Create new bank account
router.post('/', authenticateToken, async (req, res) => {
  const { user_id, account_number, account_type, status } = req.body;
  
  try {
    const { rows } = await req.db.query(
      `INSERT INTO bank_accounts 
       (user_id, account_number, account_type, status, balance, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 0, NOW(), NOW())
       RETURNING *`,
      [user_id, account_number, account_type, status || 'active']
    );
    
    // Log the action
    await req.db.query(
      `INSERT INTO logs (action, entity, entity_id, user_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      ['create', 'bank_accounts', rows[0].id, req.user?.id, JSON.stringify(req.body)]
    );
    
    res.status(201).json({ account: rows[0] });
  } catch (error) {
    console.error('Error creating bank account:', error);
    res.status(500).json({ error: 'Failed to create bank account' });
  }
});

// Update bank account
router.put('/:id', authenticateToken, async (req, res) => {
  const { account_number, account_type, status } = req.body;
  
  try {
    const { rows } = await req.db.query(
      `UPDATE bank_accounts 
       SET account_number = $1, account_type = $2, status = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [account_number, account_type, status, req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    // Log the action
    await req.db.query(
      `INSERT INTO logs (action, entity, entity_id, user_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      ['update', 'bank_accounts', rows[0].id, req.user?.id, JSON.stringify(req.body)]
    );
    
    res.json({ account: rows[0] });
  } catch (error) {
    console.error('Error updating bank account:', error);
    res.status(500).json({ error: 'Failed to update bank account' });
  }
});

// Delete bank account
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Get account before deletion
    const accountResult = await req.db.query(
      'SELECT * FROM bank_accounts WHERE id = $1',
      [req.params.id]
    );
    
    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    // Delete the account
    await req.db.query('DELETE FROM bank_accounts WHERE id = $1', [req.params.id]);
    
    // Log the action
    await req.db.query(
      `INSERT INTO logs (action, entity, entity_id, user_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'delete', 
        'bank_accounts', 
        req.params.id, 
        req.user?.id, 
        JSON.stringify({ deletedAccount: accountResult.rows[0].account_number })
      ]
    );
    
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({ error: 'Failed to delete bank account' });
  }
});

module.exports = router;
