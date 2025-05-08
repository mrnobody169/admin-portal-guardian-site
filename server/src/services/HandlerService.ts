import { IDepositResponse, ISignUpResponse } from "../interfaces";
import { AccountLoginService } from "./AccountLoginService";
import { BankAccountService } from "./BankAccountService";
import { TelegramService } from "./TelegramService";
import { SiteService } from "./SiteService";
import { TelegramOnlyLogService } from "./TelegramOnlyLogService";
import { OldSourceCSharp } from "./OldSourceCSharp";
import { TelegramOnlyCustomerService } from "./TelegramOnlyCustomerService";
import { delay } from "../utils";

export class HandlerService {
  private bankAccountService = new BankAccountService();
  private accountLoginService = new AccountLoginService();
  private telegramService = new TelegramService();
  private siteService = new SiteService();
  private telegramOnlyLogService = new TelegramOnlyLogService();
  private telegramOnlyCustomerService = new TelegramOnlyCustomerService();
  private oldSourceCSharp = new OldSourceCSharp();

  public async process(
    bank_account: IDepositResponse,
    site_id: string
  ): Promise<boolean> {
    let { account_no, account_holder, bank_name } = bank_account;

    let old_bank = await this.findByAccountNo(bank_account.account_no);
    if (old_bank) {
      return false;
    }

    await this.storeBankAccount(bank_account, site_id);
    // console.log(
    //   `Matched a new bank account: ${new_bank.account_holder} - ${new_bank.account_no} - ${new_bank.bank_name}`
    // );

    //attemp code
    let token_old_bank_ver1 = await this.oldSourceCSharp.signIn();
    let old_bank_ver1 = await this.oldSourceCSharp.findByAccountNo(
      bank_account.account_no,
      token_old_bank_ver1
    );
    if (!old_bank_ver1) {
      await this.telegramOnlyCustomerService.notifyNewBankAccount(
        site_id,
        account_no,
        account_holder,
        bank_name
      );
      await this.oldSourceCSharp.create(token_old_bank_ver1, {
        siteId: site_id,
        bankName: bank_name,
        accountName: account_holder,
        accountNumber: account_no,
      });
      await delay(500);
      console.log(
        `MATCHED A NEW BANK ACCOUNT: ${account_holder} - ${account_no} - ${bank_name}`
      );
    }
    return true;
  }

  public storeAccountLogin = async (data: ISignUpResponse, site_id: string) => {
    let { username, password, token } = data;
    return await this.accountLoginService.create({
      username,
      password,
      token,
      site_id,
      status: "active",
    });
  };

  public storeBankAccount = async (data: IDepositResponse, site_id: string) => {
    let { account_no, account_holder, bank_name } = data;
    const newAccount = await this.bankAccountService.create({
      account_no,
      account_holder,
      bank_name,
      site_id,
      status: "active",
    });

    // Get site name for the notification
    try {
      const site = await this.siteService.findBySiteId(site_id);
      const siteName = site ? site.site_name : site_id;

      // Send Telegram notification
      await this.telegramService.notifyNewBankAccount(
        siteName,
        account_no,
        account_holder,
        bank_name
      );
    } catch (error) {
      console.error(
        "Failed to send Telegram notification from HandlerService:",
        error
      );
      // Don't throw error, just log it
    }

    return newAccount;
  };

  public findByAccountNo = async (data: string) => {
    return await this.bankAccountService.findByAccountNo(data);
  };
}
