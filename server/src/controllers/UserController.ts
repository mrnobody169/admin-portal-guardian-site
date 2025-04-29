
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  private userService = new UserService();

  getUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.findAll();
      // Remove passwords from response
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json({ users: sanitizedUsers });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  getUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  createUser = async (req: Request, res: Response) => {
    const { username, password, email, name, role } = req.body;
    
    try {
      const user = await this.userService.create(
        { username, password, email, name, role }, 
        req.user?.id
      );
      
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      if (error.message === 'Username already in use') {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  updateUser = async (req: Request, res: Response) => {
    const { username, password, email, name, role } = req.body;
    
    try {
      const user = await this.userService.update(
        req.params.id,
        { username, password, email, name, role },
        req.user?.id
      );
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  deleteUser = async (req: Request, res: Response) => {
    try {
      await this.userService.delete(req.params.id, req.user?.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    try {
      const result = await this.userService.authenticate(username, password);
      
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
