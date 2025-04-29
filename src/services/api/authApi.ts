
import { BaseApiService } from "../base/baseApiService";
import { supabase } from "@/integrations/supabase/client";

class AuthApiService extends BaseApiService {
  async login(username: string, password: string) {
    try {
      // Try using Supabase for authentication first
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: username,  // We're using username as email here
        password: password,
      });
      
      if (!supabaseError && supabaseData) {
        return {
          session: supabaseData.session,
          user: supabaseData.user
        };
      }
      
      // If Supabase auth fails, fall back to local API
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
