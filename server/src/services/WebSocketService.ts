
import http from 'http';

export class WebSocketService {
  initialize(server: http.Server) {
    console.log('WebSocket service is disabled');
  }

  sendEvent(client: any, event: string, data: any) {
    // No-op function
  }

  broadcastEvent(event: string, data: any) {
    // No-op function
  }
  
  cleanup() {
    // No-op function
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();
