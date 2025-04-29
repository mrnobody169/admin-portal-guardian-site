import WebSocket from 'ws';
import http from 'http';

type WebSocketEvent = {
  event: string;
  data: any;
};

export class WebSocketService {
  private wss: WebSocket.Server | null = null;
  private clients: Set<WebSocket> = new Set();
  private pingInterval: NodeJS.Timeout | null = null;

  initialize(server: http.Server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);

      // Send a test message to verify connection
      this.sendEvent(ws, 'connection_established', { message: 'WebSocket connection established' });

      ws.on('message', (message) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          console.log('Received message:', parsedMessage);
          
          // Handle ping messages
          if (parsedMessage.type === 'ping') {
            this.sendEvent(ws, 'pong', { timestamp: Date.now() });
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          console.log('Raw message:', message.toString());
        }
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

    // Set up a ping interval to keep connections alive
    this.pingInterval = setInterval(() => {
      this.pingClients();
    }, 30000); // Every 30 seconds

    console.log('WebSocket server initialized');
  }

  private pingClients() {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendEvent(client, 'server_ping', { timestamp: Date.now() });
      }
    });
  }

  sendEvent(client: WebSocket, event: string, data: any) {
    const message: WebSocketEvent = { event, data };
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message to client:', error);
        this.clients.delete(client);
      }
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
        try {
          client.send(messageString);
        } catch (error) {
          console.error('Error broadcasting to client:', error);
          this.clients.delete(client);
        }
      }
    });
  }
  
  // Clean up resources when shutting down
  cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();
