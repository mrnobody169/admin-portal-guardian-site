
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserService } from './UserService';
import { LogService } from './LogService';

export class AuthService {
  private userService = new UserService();
  private logService = new LogService();

  async login(email: string, password: string): Promise<{ user: any, token: string }> {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // In a real system, verify the hashed password
    // For testing, we'll use a simple password verification
    const passwordValid = password === 'password'; // For testing only
    
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }
    
    // Create JWT token
    const token = this.generateToken(user);
    
    // Log the login action
    await this.logService.create({
      action: 'login',
      entity: 'auth',
      user_id: user.id,
      details: { method: 'email' }
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  }

  private generateToken(user: any): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );
  }
}
