
import { BaseApiService } from "../base/baseApiService";
import { toast } from '@/components/ui/use-toast';

class AuthApiService extends BaseApiService {
  async login(username: string, password: string) {
    try {
      console.log("Attempting authentication via backend API");
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
}

export const authApi = new AuthApiService();
