
import { toast } from "@/components/ui/use-toast";

export class BaseApiService {
  protected apiUrl = "http://localhost:4000/api";

  constructor() {
    console.log('API Service initialized');
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
}
