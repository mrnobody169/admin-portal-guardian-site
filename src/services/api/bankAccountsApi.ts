
import { BaseApiService } from "../base/baseApiService";

class BankAccountsApiService extends BaseApiService {
  async getBankAccounts() {
    try {
      const response = await fetch(`${this.apiUrl}/bank-accounts`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      throw error;
    }
  }
  
  async getBankAccount(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/bank-accounts/${id}`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching bank account:", error);
      throw error;
    }
  }

  async getBankAccountsBySiteId(siteId: string) {
    try {
      const response = await fetch(`${this.apiUrl}/bank-accounts/site/${siteId}`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching site bank accounts:", error);
      throw error;
    }
  }
  
  async createBankAccount(accountData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/bank-accounts`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(accountData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error creating bank account:", error);
      throw error;
    }
  }
  
  async updateBankAccount(id: string, accountData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/bank-accounts/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(accountData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error updating bank account:", error);
      throw error;
    }
  }
  
  async deleteBankAccount(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/bank-accounts/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting bank account:", error);
      throw error;
    }
  }
}

export const bankAccountsApi = new BankAccountsApiService();
