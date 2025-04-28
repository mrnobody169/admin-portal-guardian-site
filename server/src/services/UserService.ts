
import { getRepository } from '../database/connection';
import { User } from '../entities/User';
import { LogService } from './LogService';

export class UserService {
  private userRepository = getRepository<User>(User);
  private logService = new LogService();

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>, loggedInUserId?: string): Promise<User> {
    const existingUser = await this.findByEmail(userData.email!);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);

    // Log the action
    await this.logService.create({
      action: 'create',
      entity: 'users',
      entity_id: savedUser.id,
      user_id: loggedInUserId,
      details: { name: userData.name, email: userData.email }
    });

    return savedUser;
  }

  async update(id: string, userData: Partial<User>, loggedInUserId?: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, userData);
    const updatedUser = await this.userRepository.save(user);

    // Log the action
    await this.logService.create({
      action: 'update',
      entity: 'users',
      entity_id: id,
      user_id: loggedInUserId,
      details: userData
    });

    return updatedUser;
  }

  async delete(id: string, loggedInUserId?: string): Promise<void> {
    const user = await this.findById(id);
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
      details: { deletedUser: user.email }
    });
  }
}
