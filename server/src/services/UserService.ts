
import * as bcrypt from 'bcrypt';
import { Repository } from '../database/connection';
import { User } from '../entities/User';
import { LogService } from './LogService';

export class UserService {
  private userRepository: Repository<User>;
  private logService = new LogService();

  constructor() {
    this.userRepository = new Repository<User>('users');
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.findAll();
    // Remove passwords from the returned users
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ id });
    if (!user) return null;
    
    // Remove password from the returned user
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ username });
  }

  async create(userData: any, loggedInUserId?: string): Promise<User> {
    // Check if username already exists
    const existingUser = await this.findByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create the user
    const savedUser = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });

    // Log the action
    await this.logService.create({
      action: 'create',
      entity: 'users',
      entity_id: savedUser.id,
      user_id: loggedInUserId,
      details: { ...userData, password: '***REDACTED***' }
    });

    // Remove password from the returned user
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async update(id: string, userData: any, loggedInUserId?: string): Promise<User> {
    // Check if user exists
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new Error('User not found');
    }

    // If password is being updated, hash it
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    const updatedUser = await this.userRepository.update(id, userData);

    // Log the action
    await this.logService.create({
      action: 'update',
      entity: 'users',
      entity_id: id,
      user_id: loggedInUserId,
      details: { ...userData, password: userData.password ? '***REDACTED***' : undefined }
    });

    // Remove password from the returned user
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  async delete(id: string, loggedInUserId?: string): Promise<void> {
    // Check if user exists
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.delete(id);

    // Log the action
    await this.logService.create({
      action: 'delete',
      entity: 'users',
      entity_id: id,
      user_id: loggedInUserId,
      details: { deletedUser: user.username }
    });
  }
}
