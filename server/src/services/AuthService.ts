
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Repository } from '../database/connection';
import { User } from '../entities/User';
import { supabase } from '../database/connection';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = new Repository<User>('users');
  }

  async validateUser(username: string, password: string): Promise<any> {
    // Try Supabase auth first if available
    if (supabase) {
      try {
        const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
          email: username, // Using username as email
          password: password,
        });
        
        if (!supabaseError && supabaseData && supabaseData.user) {
          console.log("Supabase authentication successful");
          return {
            id: supabaseData.user.id,
            username: username,
            role: 'admin' // Default role, can be customized
          };
        } else {
          console.log("Supabase auth failed, trying local DB");
        }
      } catch (error) {
        console.error("Supabase auth error:", error);
        // Continue to local auth if Supabase fails
      }
    }
    
    // If Supabase auth not available or fails, try local database
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
      console.error("Local auth error:", error);
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
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
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
