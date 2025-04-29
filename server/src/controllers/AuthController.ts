
import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService = new AuthService();

  login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    try {
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
