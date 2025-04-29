
// This file should be added or updated
import { Log } from '../entities/Log';
import { Repository } from '../database/connection';

export class LogService {
  private logRepository: Repository<Log>;

  constructor() {
    this.logRepository = new Repository<Log>('logs');
  }

  async findAll(): Promise<Log[]> {
    return this.logRepository.findAll();
  }

  async create(logData: any): Promise<Log> {
    return this.logRepository.create({
      ...logData,
      created_at: new Date().toISOString()
    });
  }
}
