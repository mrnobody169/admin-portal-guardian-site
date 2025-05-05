
import { authService } from '../authService';

export class BaseApiService {
  protected apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  }

  protected getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  protected async handleResponse(response: Response) {
    // First log the status and URL for debugging
    console.log(`API Response: ${response.status} from ${response.url}`);
    
    if (!response.ok) {
      // Try to get error details if available
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `HTTP error ${response.status}`;
      } catch (e) {
        // If parsing failed, use status text
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }

      console.error('API error response:', errorMessage);
      
      // Special handling for authentication errors
      if (response.status === 401) {
        console.log('Authentication error detected, logging out...');
        authService.logout();
        window.location.href = '/login';
      }
      
      throw new Error(errorMessage);
    }

    // Check if the response is empty
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      return null;
    }

    // Parse JSON response
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      throw new Error('Invalid JSON response from server');
    }
  }
}
