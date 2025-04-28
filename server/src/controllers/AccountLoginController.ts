
import { Request, Response } from 'express';
import { AccountLoginService } from '../services/AccountLoginService';

export class AccountLoginController {
  private accountLoginService = new AccountLoginService();

  getAccountLogins = async (req: Request, res: Response) => {
    try {
      const accountLogins = await this.accountLoginService.findAll();
      res.json({ accountLogins });
    } catch (error) {
      console.error('Error fetching account logins:', error);
      res.status(500).json({ error: 'Failed to fetch account logins' });
    }
  }

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

  getAccountLoginsBySiteId = async (req: Request, res: Response) => {
    try {
      const accountLogins = await this.accountLoginService.findBySiteId(req.params.siteId);
      res.json({ accountLogins });
    } catch (error) {
      console.error('Error fetching account logins:', error);
      res.status(500).json({ error: 'Failed to fetch account logins' });
    }
  }

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
