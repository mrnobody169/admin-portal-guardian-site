
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export class BaseApiService {
  protected apiUrl = "http://localhost:4000/api";
  protected supabase = supabase;

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
      throw new Error(errorData.error || 'API request failed');
    }

    return response.json();
  }
  
  // Helper method to use Supabase directly when available
  protected getSupabase() {
    return this.supabase;
  }
}
