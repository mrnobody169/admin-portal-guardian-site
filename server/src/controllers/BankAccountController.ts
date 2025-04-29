import { Request, Response } from 'express';
import { BankAccountService } from '../services/BankAccountService';

/**
 * @swagger
 * tags:
 *   name: BankAccounts
 *   description: Bank account management endpoints
 */
export class BankAccountController {
  private bankAccountService = new BankAccountService();

  /**
   * @swagger
   * /api/bank-accounts:
   *   get:
   *     summary: Get all bank accounts
   *     tags: [BankAccounts]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of bank accounts
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accounts:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/BankAccount'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getBankAccounts = async (req: Request, res: Response) => {
    try {
      const accounts = await this.bankAccountService.findAll();
      res.json({ accounts });
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      res.status(500).json({ error: 'Failed to fetch bank accounts' });
    }
  }

  /**
   * @swagger
   * /api/bank-accounts/{id}:
   *   get:
   *     summary: Get bank account by ID
   *     tags: [BankAccounts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Bank account ID
   *     responses:
   *       200:
   *         description: Bank account details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 account:
   *                   $ref: '#/components/schemas/BankAccount'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Bank account not found
   *       500:
   *         description: Server error
   */
  getBankAccountById = async (req: Request, res: Response) => {
    try {
      const account = await this.bankAccountService.findById(req.params.id);
      
      if (!account) {
        return res.status(404).json({ error: 'Bank account not found' });
      }
      
      res.json({ account });
    } catch (error) {
      console.error('Error fetching bank account:', error);
      res.status(500).json({ error: 'Failed to fetch bank account' });
    }
  }

  /**
   * @swagger
   * /api/bank-accounts/site/{siteId}:
   *   get:
   *     summary: Get bank accounts by site ID
   *     tags: [BankAccounts]
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
   *         description: List of bank accounts for the site
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accounts:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/BankAccount'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getBankAccountsBySiteId = async (req: Request, res: Response) => {
    try {
      const accounts = await this.bankAccountService.findBySiteId(req.params.siteId);
      res.json({ accounts });
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      res.status(500).json({ error: 'Failed to fetch bank accounts' });
    }
  }

  /**
   * @swagger
   * /api/bank-accounts:
   *   post:
   *     summary: Create a new bank account
   *     tags: [BankAccounts]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - account_no
   *               - account_holder
   *               - bank_name
   *               - site_id
   *             properties:
   *               account_no:
   *                 type: string
   *               account_holder:
   *                 type: string
   *               bank_name:
   *                 type: string
   *               site_id:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       201:
   *         description: Bank account created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 account:
   *                   $ref: '#/components/schemas/BankAccount'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  createBankAccount = async (req: Request, res: Response) => {
    const { account_no, account_holder, bank_name, site_id, status } = req.body;
    
    try {
      const account = await this.bankAccountService.create(
        { 
          account_no, 
          account_holder, 
          bank_name, 
          site_id, 
          status: status || 'active'
        },
        req.user?.id
      );
      
      res.status(201).json({ account });
    } catch (error) {
      console.error('Error creating bank account:', error);
      res.status(500).json({ error: 'Failed to create bank account' });
    }
  }

  /**
   * @swagger
   * /api/bank-accounts/{id}:
   *   put:
   *     summary: Update a bank account
   *     tags: [BankAccounts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Bank account ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               account_no:
   *                 type: string
   *               account_holder:
   *                 type: string
   *               bank_name:
   *                 type: string
   *               site_id:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       200:
   *         description: Bank account updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 account:
   *                   $ref: '#/components/schemas/BankAccount'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Bank account not found
   *       500:
   *         description: Server error
   */
  updateBankAccount = async (req: Request, res: Response) => {
    const { account_no, account_holder, bank_name, site_id, status } = req.body;
    
    try {
      const account = await this.bankAccountService.update(
        req.params.id,
        {
          account_no,
          account_holder,
          bank_name,
          site_id,
          status
        },
        req.user?.id
      );
      
      res.json({ account });
    } catch (error: any) {
      console.error('Error updating bank account:', error);
      
      if (error.message === 'Bank account not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to update bank account' });
    }
  }

  /**
   * @swagger
   * /api/bank-accounts/{id}:
   *   delete:
   *     summary: Delete a bank account
   *     tags: [BankAccounts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Bank account ID
   *     responses:
   *       200:
   *         description: Bank account deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Bank account not found
   *       500:
   *         description: Server error
   */
  deleteBankAccount = async (req: Request, res: Response) => {
    try {
      await this.bankAccountService.delete(req.params.id, req.user?.id);
      res.json({ message: 'Bank account deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting bank account:', error);
      
      if (error.message === 'Bank account not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to delete bank account' });
    }
  }
}
