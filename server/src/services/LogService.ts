
import { getRepository } from '../database/connection';
import { Log } from '../entities/Log';

export class LogService {
  private logRepository = getRepository<Log>(Log);

  async findAll(): Promise<Log[]> {
    return this.logRepository.find({
      order: { created_at: 'DESC' }
    });
  }

  async create(logData: Partial<Log>): Promise<Log> {
    const log = this.logRepository.create(logData);
    return this.logRepository.save(log);
  }
}
