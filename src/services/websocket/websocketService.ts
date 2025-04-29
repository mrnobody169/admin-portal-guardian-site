
import { toast } from "@/components/ui/use-toast";

type MessageHandler = (data: any) => void;
type EventType = 'bank_account_created' | 'bank_account_updated' | 'bank_account_deleted' | 
                 'account_login_created' | 'account_login_updated' | 'account_login_deleted' |
                 'connection_established' | 'server_ping' | 'pong';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectInterval = 5000; // 5 seconds
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventHandlers: Map<EventType, MessageHandler[]> = new Map();
  private url: string;
  private isConnecting = false;
  private pingInterval: number | null = null;
  private pongReceived = false;

  constructor() {
    // Use secure WebSocket if the site is on HTTPS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    const port = hostname === 'localhost' || hostname === '127.0.0.1' ? '4000' : window.location.port;
    this.url = `${protocol}//${hostname}:${port}/ws`;
  }

  public connect(): void {
    if (this.isConnecting) return;
    
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    
    console.log('Connecting to WebSocket:', this.url);
    try {
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        
        // Set up ping interval
        this.setupPing();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          
          if (message.event === 'pong') {
            this.pongReceived = true;
            return;
          }
          
          if (message.event === 'server_ping') {
            // Respond to server pings
            this.send({ type: 'pong', timestamp: Date.now() });
            return;
          }
          
          if (message.event && this.eventHandlers.has(message.event as EventType)) {
            const handlers = this.eventHandlers.get(message.event as EventType) || [];
            handlers.forEach(handler => handler(message.data));
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.clearPingInterval();
        this.socket = null;
        this.isConnecting = false;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, this.reconnectInterval);
        } else {
          toast({
            title: "WebSocket Connection Failed",
            description: "Unable to establish real-time connection. Please refresh the page to get the latest data.",
            variant: "destructive",
          });
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnecting = false;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.reconnectInterval);
      }
    }
  }

  public disconnect(): void {
    this.clearPingInterval();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private setupPing(): void {
    this.clearPingInterval();
    this.pingInterval = window.setInterval(() => {
      this.ping();
    }, 15000); // Every 15 seconds
  }

  private clearPingInterval(): void {
    if (this.pingInterval !== null) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private ping(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Reset pong received flag
      this.pongReceived = false;
      
      // Send ping message
      this.send({ type: 'ping', timestamp: Date.now() });
      
      // Check for pong response after a timeout
      setTimeout(() => {
        if (!this.pongReceived) {
          console.warn('No pong response received, reconnecting...');
          this.reconnect();
        }
      }, 5000);
    }
  }

  private reconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
    this.connect();
  }

  private send(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    }
  }

  public subscribe(event: EventType, handler: MessageHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    const handlers = this.eventHandlers.get(event)!;
    handlers.push(handler);
    
    return () => {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }
}

export const websocketService = new WebSocketService();
