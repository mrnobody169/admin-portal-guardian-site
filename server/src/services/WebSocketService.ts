
import WebSocket from 'ws';
import http from 'http';

type WebSocketEvent = {
  event: string;
  data: any;
};

export class WebSocketService {
  private wss: WebSocket.Server | null = null;
  private clients: Set<WebSocket> = new Set();

  initialize(server: http.Server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);

      // Send a test message to verify connection
      this.sendEvent(ws, 'connection_established', { message: 'WebSocket connection established' });

      ws.on('message', (message) => {
        console.log('Received message:', message.toString());
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    console.log('WebSocket server initialized');
  }

  sendEvent(client: WebSocket, event: string, data: any) {
    const message: WebSocketEvent = { event, data };
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  broadcastEvent(event: string, data: any) {
    if (!this.wss) {
      console.error('WebSocket server not initialized');
      return;
    }

    const message: WebSocketEvent = { event, data };
    const messageString = JSON.stringify(message);

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();
