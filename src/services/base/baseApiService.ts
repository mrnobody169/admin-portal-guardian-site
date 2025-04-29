
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export class BaseApiService {
  protected apiUrl = "http://localhost:4000/api";
  protected supabase = supabase;

  constructor() {
    // Log Supabase availability at initialization
    if (this.supabase) {
      console.log('Supabase client available in BaseApiService');
    } else {
      console.log('Supabase client not available, will use local API');
    }
  }

  // Add auth token if available
  getHeaders() {
    const token = localStorage.getItem('authToken');

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Handle API responses consistently
  protected async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || 'API request failed';
      console.error('API error:', errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  }
  
  // Helper method to use Supabase directly when available
  protected getSupabase() {
    return this.supabase;
  }
}
