
import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication endpoints
 */
export class AuthController {
  private authService = new AuthService();

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login to the system
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 session:
   *                   type: object
   *                   properties:
   *                     access_token:
   *                       type: string
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Invalid credentials
   *       500:
   *         description: Server error
   */
  login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    try {
      console.log(`Login attempt for user: ${username}`);
      const result = await this.authService.login(username, password);
      
      res.json({
        session: { access_token: result.token },
        user: result.user
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
}
