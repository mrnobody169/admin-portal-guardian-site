
import { BaseApiService } from "../base/baseApiService";

class AccountLoginsApiService extends BaseApiService {
  async getAccountLogins() {
    try {
      const response = await fetch(`${this.apiUrl}/account-logins`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching account logins:", error);
      throw error;
    }
  }

  async getAccountLogin(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/account-logins/${id}`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching account login:", error);
      throw error;
    }
  }

  async getAccountLoginsBySite(siteId: string) {
    try {
      const response = await fetch(`${this.apiUrl}/account-logins/site/${siteId}`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching site account logins:", error);
      throw error;
    }
  }

  async createAccountLogin(loginData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/account-logins`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(loginData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error creating account login:", error);
      throw error;
    }
  }

  async updateAccountLogin(id: string, loginData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/account-logins/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(loginData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error updating account login:", error);
      throw error;
    }
  }

  async deleteAccountLogin(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/account-logins/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting account login:", error);
      throw error;
    }
  }
}

export const accountLoginsApi = new AccountLoginsApiService();
