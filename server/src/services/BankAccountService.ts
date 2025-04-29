import { AppDataSource, getRepository } from "../database/connection";
import { BankAccount } from "../entities/BankAccount";
import { LogService } from "./LogService";

export class BankAccountService {
  private bankAccountRepository = getRepository<BankAccount>(BankAccount);
  private logService = new LogService();

  async findAll(): Promise<BankAccount[]> {
    return this.bankAccountRepository.find();
  }

  async findById(id: string): Promise<BankAccount | null> {
    return this.bankAccountRepository.findOne({ where: { id } });
  }

  async findByAccountNo(account_no: string): Promise<BankAccount | null> {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source initialized for proxy creation.");
    }
    return this.bankAccountRepository.findOne({
      where: { account_no },
    });
  }

  async findBySiteId(siteId: string): Promise<BankAccount[]> {
    return this.bankAccountRepository.find({ where: { site_id: siteId } });
  }

  async create(
    accountData: Partial<BankAccount>,
    loggedInUserId?: string
  ): Promise<BankAccount> {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source initialized for proxy creation.");
    }
    const account = this.bankAccountRepository.create(accountData);

    const savedAccount = await this.bankAccountRepository.save(account);

    // Log the action
    await this.logService.create({
      action: "create",
      entity: "bank_accounts",
      entity_id: savedAccount.id,
      user_id: loggedInUserId,
      details: accountData,
    });

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

    Object.assign(account, accountData);
    const updatedAccount = await this.bankAccountRepository.save(account);

    // Log the action
    await this.logService.create({
      action: "update",
      entity: "bank_accounts",
      entity_id: id,
      user_id: loggedInUserId,
      details: accountData,
    });

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
  }
}
