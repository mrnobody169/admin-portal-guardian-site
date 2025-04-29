
import { BaseApiService } from "../base/baseApiService";

class SitesApiService extends BaseApiService {
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

  async getSite(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/sites/${id}`, { 
        headers: this.getHeaders() 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching site:", error);
      throw error;
    }
  }

  async createSite(siteData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/sites`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(siteData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error creating site:", error);
      throw error;
    }
  }

  async updateSite(id: string, siteData: any) {
    try {
      const response = await fetch(`${this.apiUrl}/sites/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(siteData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error updating site:", error);
      throw error;
    }
  }

  async deleteSite(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/sites/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting site:", error);
      throw error;
    }
  }
}

export const sitesApi = new SitesApiService();
