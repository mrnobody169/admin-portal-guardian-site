import { IDepositResponse, ISignUpResponse } from "../interfaces";
import { AccountLoginService } from "./AccountLoginService";
import { BankAccountService } from "./BankAccountService";

export class HandlerService {
  private bankAccountService = new BankAccountService();
  private accountLoginService = new AccountLoginService();

  public async process(
    bank_account: IDepositResponse,
    site_id: string
  ): Promise<boolean> {
    let old_bank = await this.findByAccountNo(bank_account.account_no);
    if (old_bank) {
      return false;
    }
    let new_bank = await this.storeBankAccount(bank_account, site_id);
    console.log(
      `Matched a new bank account: ${new_bank.account_holder} - ${new_bank.account_no} - ${new_bank.bank_name}`
    );
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
    return await this.bankAccountService.create({
      account_no,
      account_holder,
      bank_name,
      site_id,
      status: "active",
    });
  };

  public findByAccountNo = async (data: string) => {
    return await this.bankAccountService.findByAccountNo(data);
  };
}
