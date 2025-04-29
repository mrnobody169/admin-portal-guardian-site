
import { BaseApiService } from "../base/baseApiService";
import { toast } from '@/components/ui/use-toast';

class AuthApiService extends BaseApiService {
  async login(username: string, password: string) {
    try {
      // Check if we should use Supabase based on the DB_MODE
      if (this.supabase) {
        try {
          console.log("Attempting Supabase authentication");
          const { data: supabaseData, error: supabaseError } = await this.supabase.auth.signInWithPassword({
            email: username,  // We're using username as email here
            password: password,
          });
          
          if (!supabaseError && supabaseData) {
            console.log("Supabase authentication successful");
            return {
              session: supabaseData.session,
              user: supabaseData.user
            };
          } else {
            console.log("Supabase auth failed, error:", supabaseError?.message);
          }
        } catch (supabaseError) {
          console.error("Supabase authentication error:", supabaseError);
          // Continue to local API if Supabase fails
        }
      }
      
      // If Supabase auth fails or is not available, fall back to local API
      console.log("Falling back to local API authentication");
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
