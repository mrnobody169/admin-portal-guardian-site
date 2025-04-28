import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

// API service for frontend to communicate with backend
class ApiService {
  private apiUrl = "http://localhost:4000/api"; // Using local server

  // Add auth token if available
  private async getHeaders() {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Users API
  async getUsers() {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/users`, { headers });
    return response.json();
  }
  
  async createUser(userData: Omit<Tables<'users'>, 'id' | 'created_at' | 'updated_at'>) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  // Bank Accounts API
  async getBankAccounts() {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/bank-accounts`, { headers });
    return response.json();
  }
  
  async getBankAccount(id: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/bank-accounts/${id}`, { headers });
    return response.json();
  }
  
  async createBankAccount(accountData: Omit<Tables<'bank_accounts'>, 'id' | 'created_at' | 'updated_at' | 'balance'>) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/bank-accounts`, {
      method: "POST",
      headers,
      body: JSON.stringify(accountData),
    });
    return response.json();
  }

  // Sites API
  async getSites() {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/sites`, { headers });
    return response.json();
  }

  async getSite(id: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/sites/${id}`, { headers });
    return response.json();
  }

  async createSite(siteData: { site_name: string; site_id: string; status?: string }) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/sites`, {
      method: "POST",
      headers,
      body: JSON.stringify(siteData),
    });
    return response.json();
  }

  async updateSite(id: string, siteData: { site_name?: string; site_id?: string; status?: string }) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/sites/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(siteData),
    });
    return response.json();
  }

  async deleteSite(id: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/sites/${id}`, {
      method: "DELETE",
      headers,
    });
    return response.json();
  }

  // Account Logins API
  async getAccountLogins() {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/account-logins`, { headers });
    return response.json();
  }

  async getAccountLogin(id: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/account-logins/${id}`, { headers });
    return response.json();
  }

  async getAccountLoginsBySite(siteId: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/account-logins/site/${siteId}`, { headers });
    return response.json();
  }

  async createAccountLogin(loginData: { username: string; password: string; token?: string; site_id: string; status?: string }) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/account-logins`, {
      method: "POST",
      headers,
      body: JSON.stringify(loginData),
    });
    return response.json();
  }

  async updateAccountLogin(id: string, loginData: { username?: string; password?: string; token?: string; site_id?: string; status?: string }) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/account-logins/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(loginData),
    });
    return response.json();
  }

  async deleteAccountLogin(id: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/account-logins/${id}`, {
      method: "DELETE",
      headers,
    });
    return response.json();
  }

  // Logs API
  async getLogs() {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/logs`, { headers });
    return response.json();
  }
  
  async createLog(logData: Omit<Tables<'logs'>, 'id' | 'created_at'>) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/logs`, {
      method: "POST",
      headers,
      body: JSON.stringify(logData),
    });
    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }
}

export const apiService = new ApiService();
