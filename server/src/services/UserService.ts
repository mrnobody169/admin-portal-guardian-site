
import { getRepository } from '../database/connection';
import { User } from '../entities/User';
import { LogService } from './LogService';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserService {
  private userRepository = getRepository<User>(User);
  private logService = new LogService();

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const existingUser = await this.findByUsername(userData.username!);
    if (existingUser) {
      throw new Error('Username already in use');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password as string, saltRounds);
    
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword
    });
    
    const savedUser = await this.userRepository.save(user);

    // Log the action
    await this.logService.create({
      action: 'create',
      entity: 'users',
      entity_id: savedUser.id,
      details: { username: userData.username, role: userData.role }
    });

    return savedUser;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // If updating password, hash it
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    Object.assign(user, userData);
    const updatedUser = await this.userRepository.save(user);

    // Log the action
    await this.logService.create({
      action: 'update',
      entity: 'users',
      entity_id: id,
      details: { username: userData.username }
    });

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.delete(id);

    // Log the action
    await this.logService.create({
      action: 'delete',
      entity: 'users',
      details: { deletedUser: user.username }
    });
  }

  async authenticate(username: string, password: string): Promise<{ user: User; token: string } | null> {
    console.log(`Authenticating user: ${username}`);
    const user = await this.findByUsername(username);
    if (!user) {
      console.log(`User not found: ${username}`);
      return null;
    }

    console.log(`User found, comparing passwords`);
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log(`Password mismatch for user: ${username}`);
      return null;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    // Log the action
    await this.logService.create({
      action: 'login',
      entity: 'users',
      details: { method: 'password' }
    });

    console.log(`Authentication successful for user: ${username}`);
    return { user, token };
  }
}
