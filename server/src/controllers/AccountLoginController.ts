import { Request, Response } from 'express';
import { AccountLoginService } from '../services/AccountLoginService';

/**
 * @swagger
 * tags:
 *   name: AccountLogins
 *   description: Account login management endpoints
 */
export class AccountLoginController {
  private accountLoginService = new AccountLoginService();

  /**
   * @swagger
   * /api/account-logins:
   *   get:
   *     summary: Get all account logins
   *     tags: [AccountLogins]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of account logins
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accountLogins:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AccountLogin'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getAccountLogins = async (req: Request, res: Response) => {
    try {
      const accountLogins = await this.accountLoginService.findAll();
      res.json({ accountLogins });
    } catch (error) {
      console.error('Error fetching account logins:', error);
      res.status(500).json({ error: 'Failed to fetch account logins' });
    }
  }

  /**
   * @swagger
   * /api/account-logins/{id}:
   *   get:
   *     summary: Get account login by ID
   *     tags: [AccountLogins]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Account login ID
   *     responses:
   *       200:
   *         description: Account login details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accountLogin:
   *                   $ref: '#/components/schemas/AccountLogin'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Account login not found
   *       500:
   *         description: Server error
   */
  getAccountLoginById = async (req: Request, res: Response) => {
    try {
      const accountLogin = await this.accountLoginService.findById(req.params.id);
      
      if (!accountLogin) {
        return res.status(404).json({ error: 'Account login not found' });
      }
      
      res.json({ accountLogin });
    } catch (error) {
      console.error('Error fetching account login:', error);
      res.status(500).json({ error: 'Failed to fetch account login' });
    }
  }

  /**
   * @swagger
   * /api/account-logins/site/{siteId}:
   *   get:
   *     summary: Get account logins by site ID
   *     tags: [AccountLogins]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: siteId
   *         required: true
   *         schema:
   *           type: string
   *         description: Site ID
   *     responses:
   *       200:
   *         description: List of account logins for the site
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accountLogins:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AccountLogin'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getAccountLoginsBySiteId = async (req: Request, res: Response) => {
    try {
      const accountLogins = await this.accountLoginService.findBySiteId(req.params.siteId);
      res.json({ accountLogins });
    } catch (error) {
      console.error('Error fetching account logins:', error);
      res.status(500).json({ error: 'Failed to fetch account logins' });
    }
  }

  /**
   * @swagger
   * /api/account-logins:
   *   post:
   *     summary: Create a new account login
   *     tags: [AccountLogins]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *               - site_id
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *               token:
   *                 type: string
   *               site_id:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       201:
   *         description: Account login created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accountLogin:
   *                   $ref: '#/components/schemas/AccountLogin'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  createAccountLogin = async (req: Request, res: Response) => {
    const { username, password, token, site_id, status } = req.body;
    
    try {
      const accountLogin = await this.accountLoginService.create(
        { 
          username, 
          password, 
          token, 
          site_id, 
          status: status || 'active'
        },
        req.user?.id
      );
      
      res.status(201).json({ 
        accountLogin: {
          ...accountLogin,
          password: '***REDACTED***' // Don't return the actual password
        }
      });
    } catch (error) {
      console.error('Error creating account login:', error);
      res.status(500).json({ error: 'Failed to create account login' });
    }
  }

  /**
   * @swagger
   * /api/account-logins/{id}:
   *   put:
   *     summary: Update an account login
   *     tags: [AccountLogins]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Account login ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *               token:
   *                 type: string
   *               site_id:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       200:
   *         description: Account login updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accountLogin:
   *                   $ref: '#/components/schemas/AccountLogin'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Account login not found
   *       500:
   *         description: Server error
   */
  updateAccountLogin = async (req: Request, res: Response) => {
    const { username, password, token, site_id, status } = req.body;
    
    try {
      const accountLogin = await this.accountLoginService.update(
        req.params.id,
        {
          username,
          password,
          token,
          site_id,
          status
        },
        req.user?.id
      );
      
      res.json({ 
        accountLogin: {
          ...accountLogin,
          password: '***REDACTED***' // Don't return the actual password
        }
      });
    } catch (error: any) {
      console.error('Error updating account login:', error);
      
      if (error.message === 'Account login not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to update account login' });
    }
  }

  /**
   * @swagger
   * /api/account-logins/{id}:
   *   delete:
   *     summary: Delete an account login
   *     tags: [AccountLogins]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Account login ID
   *     responses:
   *       200:
   *         description: Account login deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Account login not found
   *       500:
   *         description: Server error
   */
  deleteAccountLogin = async (req: Request, res: Response) => {
    try {
      await this.accountLoginService.delete(req.params.id, req.user?.id);
      res.json({ message: 'Account login deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting account login:', error);
      
      if (error.message === 'Account login not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to delete account login' });
    }
  }
}
