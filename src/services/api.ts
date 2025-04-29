
import { BaseApiService } from "./base/baseApiService";
import { authApi } from "./api/authApi";
import { usersApi } from "./api/usersApi";
import { bankAccountsApi } from "./api/bankAccountsApi";
import { sitesApi } from "./api/sitesApi";
import { accountLoginsApi } from "./api/accountLoginsApi";
import { logsApi } from "./api/logsApi";

// Re-export all API services
export {
  authApi,
  usersApi,
  bankAccountsApi,
  sitesApi,
  accountLoginsApi,
  logsApi
};

// Create a single instance for backward compatibility
class ApiService extends BaseApiService {
  // Auth methods
  login = authApi.login.bind(authApi);
  
  // User methods
  getUsers = usersApi.getUsers.bind(usersApi);
  createUser = usersApi.createUser.bind(usersApi);
  getUserById = usersApi.getUserById.bind(usersApi);
  updateUser = usersApi.updateUser.bind(usersApi);
  deleteUser = usersApi.deleteUser.bind(usersApi);
  
  // Bank Accounts methods
  getBankAccounts = bankAccountsApi.getBankAccounts.bind(bankAccountsApi);
  getBankAccount = bankAccountsApi.getBankAccount.bind(bankAccountsApi);
  getBankAccountsBySiteId = bankAccountsApi.getBankAccountsBySiteId.bind(bankAccountsApi);
  createBankAccount = bankAccountsApi.createBankAccount.bind(bankAccountsApi);
  updateBankAccount = bankAccountsApi.updateBankAccount.bind(bankAccountsApi);
  deleteBankAccount = bankAccountsApi.deleteBankAccount.bind(bankAccountsApi);
  
  // Sites methods
  getSites = sitesApi.getSites.bind(sitesApi);
  getSite = sitesApi.getSite.bind(sitesApi);
  createSite = sitesApi.createSite.bind(sitesApi);
  updateSite = sitesApi.updateSite.bind(sitesApi);
  deleteSite = sitesApi.deleteSite.bind(sitesApi);
  
  // Account Logins methods
  getAccountLogins = accountLoginsApi.getAccountLogins.bind(accountLoginsApi);
  getAccountLogin = accountLoginsApi.getAccountLogin.bind(accountLoginsApi);
  getAccountLoginsBySite = accountLoginsApi.getAccountLoginsBySite.bind(accountLoginsApi);
  createAccountLogin = accountLoginsApi.createAccountLogin.bind(accountLoginsApi);
  updateAccountLogin = accountLoginsApi.updateAccountLogin.bind(accountLoginsApi);
  deleteAccountLogin = accountLoginsApi.deleteAccountLogin.bind(accountLoginsApi);
  
  // Logs methods
  getLogs = logsApi.getLogs.bind(logsApi);
  createLog = logsApi.createLog.bind(logsApi);
}

// Export a singleton instance for backward compatibility
export const apiService = new ApiService();
