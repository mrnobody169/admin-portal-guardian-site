
import { getRepository } from '../database/connection';
import { AccountLogin } from '../entities/AccountLogin';
import { LogService } from './LogService';

export class AccountLoginService {
  private accountLoginRepository = getRepository<AccountLogin>(AccountLogin);
  private logService = new LogService();

  async findAll(): Promise<AccountLogin[]> {
    return this.accountLoginRepository.find();
  }

  async findById(id: string): Promise<AccountLogin | null> {
    return this.accountLoginRepository.findOne({ where: { id } });
  }

  async findBySiteId(siteId: string): Promise<AccountLogin[]> {
    return this.accountLoginRepository.find({ where: { site_id: siteId } });
  }

  async create(accountLoginData: Partial<AccountLogin>, loggedInUserId?: string): Promise<AccountLogin> {
    const accountLogin = this.accountLoginRepository.create(accountLoginData);
    
    const savedAccountLogin = await this.accountLoginRepository.save(accountLogin);

    // Log the action
    await this.logService.create({
      action: 'create',
      entity: 'account_logins',
      entity_id: savedAccountLogin.id,
      user_id: loggedInUserId,
      details: { ...accountLoginData, password: '***REDACTED***' } // Don't log the actual password
    });

    return savedAccountLogin;
  }

  async update(id: string, accountLoginData: Partial<AccountLogin>, loggedInUserId?: string): Promise<AccountLogin> {
    const accountLogin = await this.findById(id);
    if (!accountLogin) {
      throw new Error('Account login not found');
    }

    Object.assign(accountLogin, accountLoginData);
    const updatedAccountLogin = await this.accountLoginRepository.save(accountLogin);

    // Log the action
    await this.logService.create({
      action: 'update',
      entity: 'account_logins',
      entity_id: id,
      user_id: loggedInUserId,
      details: { ...accountLoginData, password: accountLoginData.password ? '***REDACTED***' : undefined }
    });

    return updatedAccountLogin;
  }

  async delete(id: string, loggedInUserId?: string): Promise<void> {
    const accountLogin = await this.findById(id);
    if (!accountLogin) {
      throw new Error('Account login not found');
    }

    await this.accountLoginRepository.delete(id);

    // Log the action
    await this.logService.create({
      action: 'delete',
      entity: 'account_logins',
      entity_id: id,
      user_id: loggedInUserId,
      details: { deletedAccountLogin: accountLogin.username }
    });
  }
}
