
import jwt from 'jsonwebtoken';
import { UserService } from './UserService';
import { LogService } from './LogService';

export class AuthService {
  private userService = new UserService();
  private logService = new LogService();
  private jwtSecret = process.env.JWT_SECRET || 'default_secret';

  async login(username: string, password: string): Promise<{ user: any, token: string }> {
    const result = await this.userService.authenticate(username, password);
    
    if (!result) {
      throw new Error('Invalid credentials');
    }
    
    // Log the login action
    await this.logService.create({
      action: 'login',
      entity: 'auth',
      user_id: result.user.id,
      details: { method: 'username' }
    });
    
    const { password: _, ...userWithoutPassword } = result.user;
    
    return {
      user: userWithoutPassword,
      token: result.token
    };
  }
}
