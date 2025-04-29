
import { BaseApiService } from "../base/baseApiService";

class LogsApiService extends BaseApiService {
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

export const logsApi = new LogsApiService();
