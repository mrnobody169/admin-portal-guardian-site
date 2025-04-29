
import { BaseApiService } from "../base/baseApiService";

class UsersApiService extends BaseApiService {
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
}

export const usersApi = new UsersApiService();
