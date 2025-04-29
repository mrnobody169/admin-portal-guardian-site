
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AccountUsers
 *   description: Account user management endpoints
 */

/**
 * @swagger
 * /api/account-users:
 *   get:
 *     summary: Get all account users
 *     tags: [AccountUsers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of account users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, (req, res) => {
  // This route is not yet implemented
  res.status(501).json({ error: 'Not implemented' });
});

export default router;
