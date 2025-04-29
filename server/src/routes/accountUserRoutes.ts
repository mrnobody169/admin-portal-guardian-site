
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

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
router.get('/', authenticateToken, userController.getUsers);

export default router;
