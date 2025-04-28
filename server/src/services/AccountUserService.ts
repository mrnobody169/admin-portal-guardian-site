
import { getRepository } from '../database/connection';
import { AccountUser } from '../entities/AccountUser';
import { LogService } from './LogService';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AccountUserService {
  private accountUserRepository = getRepository<AccountUser>(AccountUser);
  private logService = new LogService();

  async findAll(): Promise<AccountUser[]> {
    return this.accountUserRepository.find();
  }

  async findById(id: string): Promise<AccountUser | null> {
    return this.accountUserRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<AccountUser | null> {
    return this.accountUserRepository.findOne({ where: { username } });
  }

  async create(userData: Partial<AccountUser>, loggedInUserId?: string): Promise<AccountUser> {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password as string, saltRounds);
    
    const user = this.accountUserRepository.create({
      ...userData,
      password: hashedPassword
    });
    
    const savedUser = await this.accountUserRepository.save(user);

    // Log the action
    await this.logService.create({
      action: 'create',
      entity: 'account_users',
      entity_id: savedUser.id,
      user_id: loggedInUserId,
      details: { username: userData.username, role: userData.role }
    });

    return savedUser;
  }

  async update(id: string, userData: Partial<AccountUser>, loggedInUserId?: string): Promise<AccountUser> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Account user not found');
    }

    // If updating password, hash it
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    Object.assign(user, userData);
    const updatedUser = await this.accountUserRepository.save(user);

    // Log the action
    await this.logService.create({
      action: 'update',
      entity: 'account_users',
      entity_id: id,
      user_id: loggedInUserId,
      details: { username: userData.username, role: userData.role }
    });

    return updatedUser;
  }

  async delete(id: string, loggedInUserId?: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Account user not found');
    }

    await this.accountUserRepository.delete(id);

    // Log the action
    await this.logService.create({
      action: 'delete',
      entity: 'account_users',
      entity_id: id,
      user_id: loggedInUserId,
      details: { deletedUser: user.username }
    });
  }

  async authenticate(username: string, password: string): Promise<{ user: AccountUser; token: string } | null> {
    const user = await this.findByUsername(username);
    if (!user) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
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
      entity: 'account_users',
      entity_id: user.id,
      user_id: user.id,
      details: { method: 'password' }
    });

    return { user, token };
  }
}
