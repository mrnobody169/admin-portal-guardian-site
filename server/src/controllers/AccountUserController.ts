
import { Request, Response } from 'express';
import { AccountUserService } from '../services/AccountUserService';

export class AccountUserController {
  private accountUserService = new AccountUserService();

  getAccountUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.accountUserService.findAll();
      // Remove password from response
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json({ users: sanitizedUsers });
    } catch (error) {
      console.error('Error fetching account users:', error);
      res.status(500).json({ error: 'Failed to fetch account users' });
    }
  }

  getAccountUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.accountUserService.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Account user not found' });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Error fetching account user:', error);
      res.status(500).json({ error: 'Failed to fetch account user' });
    }
  }

  createAccountUser = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    
    try {
      // Check if username already exists
      const existingUser = await this.accountUserService.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      const user = await this.accountUserService.create(
        { 
          username, 
          password, 
          role: role || 'admin'
        },
        req.user?.id
      );
      
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Error creating account user:', error);
      res.status(500).json({ error: 'Failed to create account user' });
    }
  }

  updateAccountUser = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    
    try {
      const user = await this.accountUserService.update(
        req.params.id,
        {
          username,
          password,
          role
        },
        req.user?.id
      );
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error('Error updating account user:', error);
      
      if (error.message === 'Account user not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to update account user' });
    }
  }

  deleteAccountUser = async (req: Request, res: Response) => {
    try {
      await this.accountUserService.delete(req.params.id, req.user?.id);
      res.json({ message: 'Account user deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting account user:', error);
      
      if (error.message === 'Account user not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to delete account user' });
    }
  }

  login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    try {
      const result = await this.accountUserService.authenticate(username, password);
      
      if (!result) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const { user, token } = result;
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        session: { access_token: token },
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
}
