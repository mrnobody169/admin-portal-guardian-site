
import { AppDataSource, Repository } from "../database/connection";
import { AccountLogin } from "../entities/AccountLogin";
import { LogService } from "./LogService";

export class AccountLoginService {
  private accountLoginRepository: Repository<AccountLogin>;
  private logService = new LogService();

  constructor() {
    this.accountLoginRepository = new Repository<AccountLogin>('account_logins');
  }

  async findAll(): Promise<AccountLogin[]> {
    return this.accountLoginRepository.findAll();
  }

  async findById(id: string): Promise<AccountLogin | null> {
    return this.accountLoginRepository.findOne({ id });
  }

  async findBySiteId(siteId: string): Promise<AccountLogin[]> {
    // For the findBySiteId method, we'll need to implement custom logic
    const allLogins = await this.findAll();
    return allLogins.filter(login => login.site_id === siteId);
  }

  async create(
    accountLoginData: Partial<AccountLogin>,
    loggedInUserId?: string
  ): Promise<AccountLogin> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      // console.log("Data Source initialized for proxy creation.");
    }
    const savedAccountLogin = await this.accountLoginRepository.create(accountLoginData);

    // Log the action
    await this.logService.create({
      action: "create",
      entity: "account_logins",
      entity_id: savedAccountLogin.id,
      user_id: loggedInUserId,
      details: { ...accountLoginData, password: "***REDACTED***" }, // Don't log the actual password
    });

    return savedAccountLogin;
  }

  async update(
    id: string,
    accountLoginData: Partial<AccountLogin>,
    loggedInUserId?: string
  ): Promise<AccountLogin> {
    const accountLogin = await this.findById(id);
    if (!accountLogin) {
      throw new Error("Account login not found");
    }

    const updatedAccountLogin = await this.accountLoginRepository.update(id, accountLoginData);

    // Log the action
    await this.logService.create({
      action: "update",
      entity: "account_logins",
      entity_id: id,
      user_id: loggedInUserId,
      details: {
        ...accountLoginData,
        password: accountLoginData.password ? "***REDACTED***" : undefined,
      },
    });

    return updatedAccountLogin;
  }

  async delete(id: string, loggedInUserId?: string): Promise<void> {
    const accountLogin = await this.findById(id);
    if (!accountLogin) {
      throw new Error("Account login not found");
    }

    await this.accountLoginRepository.delete(id);

    // Log the action
    await this.logService.create({
      action: "delete",
      entity: "account_logins",
      entity_id: id,
      user_id: loggedInUserId,
      details: { deletedAccountLogin: accountLogin.username },
    });
  }
}
