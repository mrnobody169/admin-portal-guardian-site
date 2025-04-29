
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Repository } from '../database/connection';
import { User } from '../entities/User';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = new Repository<User>('users');
  }

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ username });

      if (!user) {
        throw new Error('Invalid username or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid username or password');
      }

      // Don't include password in the returned object
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }

  generateToken(user: any): string {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
