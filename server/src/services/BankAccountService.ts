
import { AppDataSource, Repository } from "../database/connection";
import { BankAccount } from "../entities/BankAccount";
import { LogService } from "./LogService";
import { webSocketService } from "./WebSocketService";

export class BankAccountService {
  private bankAccountRepository: Repository<BankAccount>;
  private logService = new LogService();

  constructor() {
    this.bankAccountRepository = new Repository<BankAccount>('bank_accounts');
  }

  async findAll(): Promise<BankAccount[]> {
    return this.bankAccountRepository.findAll();
  }

  async findById(id: string): Promise<BankAccount | null> {
    return this.bankAccountRepository.findOne({ id });
  }

  async findByAccountNo(account_no: string): Promise<BankAccount | null> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source initialized for proxy creation.");
    }
    return this.bankAccountRepository.findOne({ account_no });
  }

  async findBySiteId(siteId: string): Promise<BankAccount[]> {
    // For the findBySiteId method, we'll need to implement custom logic
    const allAccounts = await this.findAll();
    return allAccounts.filter(account => account.site_id === siteId);
  }

  async create(
    accountData: Partial<BankAccount>,
    loggedInUserId?: string
  ): Promise<BankAccount> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source initialized for proxy creation.");
    }
    const savedAccount = await this.bankAccountRepository.create(accountData);

    // Log the action
    await this.logService.create({
      action: "create",
      entity: "bank_accounts",
      entity_id: savedAccount.id,
      user_id: loggedInUserId,
      details: accountData,
    });

    // Notify clients through WebSocket
    webSocketService.broadcastEvent('bank_account_created', { account: savedAccount });

    return savedAccount;
  }

  async update(
    id: string,
    accountData: Partial<BankAccount>,
    loggedInUserId?: string
  ): Promise<BankAccount> {
    const account = await this.findById(id);
    if (!account) {
      throw new Error("Bank account not found");
    }

    const updatedAccount = await this.bankAccountRepository.update(id, accountData);

    // Log the action
    await this.logService.create({
      action: "update",
      entity: "bank_accounts",
      entity_id: id,
      user_id: loggedInUserId,
      details: accountData,
    });

    // Notify clients through WebSocket
    webSocketService.broadcastEvent('bank_account_updated', { account: updatedAccount });

    return updatedAccount;
  }

  async delete(id: string, loggedInUserId?: string): Promise<void> {
    const account = await this.findById(id);
    if (!account) {
      throw new Error("Bank account not found");
    }

    await this.bankAccountRepository.delete(id);

    // Log the action
    await this.logService.create({
      action: "delete",
      entity: "bank_accounts",
      entity_id: id,
      user_id: loggedInUserId,
      details: { deletedAccount: account.account_no },
    });

    // Notify clients through WebSocket
    webSocketService.broadcastEvent('bank_account_deleted', { id });
  }
}
