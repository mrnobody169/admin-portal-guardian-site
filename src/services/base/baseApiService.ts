
import { toast } from "@/components/ui/use-toast";

export class BaseApiService {
  protected apiUrl = "http://localhost:4000/api";

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
}
