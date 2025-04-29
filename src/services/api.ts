import { toast } from "@/components/ui/use-toast";

// API service for frontend to communicate with backend
class ApiService {
  private apiUrl = "http://localhost:4000/api"; // Using local server

  // Add auth token if available
  getHeaders() {
    const token = localStorage.getItem('authToken');

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Handle API responses consistently
  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'API request failed');
    }

    return response.json();
  }

  // Authentication
  async login(username: string, password: string) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Users API
  async getUsers() {
    try {
      const response = await fetch(`${this.apiUrl}/users`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }
  
  async createUser(userData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/users`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/users/${id}`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async updateUser(id: string, userData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/users/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/users/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Bank Accounts API
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

  // Sites API
  async getSites() {
    try {
      const response = await fetch(`${this.apiUrl}/sites`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching sites:", error);
      throw error;
    }
  }

  async getSite(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/sites/${id}`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching site:", error);
      throw error;
    }
  }

  async createSite(siteData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/sites`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(siteData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error creating site:", error);
      throw error;
    }
  }

  async updateSite(id: string, siteData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/sites/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(siteData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error updating site:", error);
      throw error;
    }
  }

  async deleteSite(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/sites/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting site:", error);
      throw error;
    }
  }

  // Account Logins API
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

  // Logs API
  async getLogs() {
    try {
      const response = await fetch(`${this.apiUrl}/logs`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
  }
  
  async createLog(logData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/logs`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(logData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error creating log:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
