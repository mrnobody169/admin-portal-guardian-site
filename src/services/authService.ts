import { apiService } from "./api";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  username: string;
  role: string;
  [key: string]: any;
}

class AuthService {
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  logout(navigate?: (path: string) => void): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    toast({
      title: "Logged out successfully",
    });
    if (navigate) {
      navigate("/login");
    }
  }

  async login(username: string, password: string) {
    try {
      const response = await apiService.login(username, password);

      if (response && response.session) {
        localStorage.setItem("authToken", response.session.access_token);

        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }

        return {
          success: true,
          user: response.user,
        };
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  hasPermission(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Basic role check. This could be expanded for more complex permissions
    switch (requiredRole) {
      case "admin":
        return user.role === "admin";
      case "user":
        return ["admin", "user"].includes(user.role);
      default:
        return false;
    }
  }
}

export const authService = new AuthService();
