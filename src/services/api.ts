
import { supabase } from "@/integrations/supabase/client";

// API service for frontend to communicate with backend
class ApiService {
  private apiUrl = "https://wvyleuiwbmbpfpmrstgg.functions.supabase.co/api";

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
  
  async createUser(userData: any) {
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
  
  async createBankAccount(accountData: any) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/bank-accounts`, {
      method: "POST",
      headers,
      body: JSON.stringify(accountData),
    });
    return response.json();
  }

  // Logs API
  async getLogs() {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.apiUrl}/logs`, { headers });
    return response.json();
  }
  
  async createLog(logData: any) {
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
