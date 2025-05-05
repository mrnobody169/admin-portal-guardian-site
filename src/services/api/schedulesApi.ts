
import { BaseApiService } from "../base/baseApiService";

class SchedulesApiService extends BaseApiService {
  async getSites() {
    try {
      const response = await fetch(`${this.apiUrl}/sites`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching sites:", error);
      throw error;
    }
  }

  async getAllSchedules() {
    try {
      const response = await fetch(`${this.apiUrl}/schedules`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      throw error;
    }
  }

  async getSchedule(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/schedules/${id}`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      throw error;
    }
  }

  async createSchedule(scheduleData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/schedules`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(scheduleData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw error;
    }
  }

  async updateSchedule(id: string, scheduleData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/schedules/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(scheduleData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error updating schedule:", error);
      throw error;
    }
  }

  async deleteSchedule(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/schedules/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      throw error;
    }
  }

  async runTask(siteId: string | null) {
    try {
      const endpoint = siteId 
        ? `${this.apiUrl}/schedules/run/${siteId}`
        : `${this.apiUrl}/schedules/run-all`;
        
      const response = await fetch(endpoint, {
        method: "POST",
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error running task:", error);
      throw error;
    }
  }
}

export const schedulesApi = new SchedulesApiService();
