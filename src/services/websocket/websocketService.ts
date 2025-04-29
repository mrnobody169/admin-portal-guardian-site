
import { toast } from "@/components/ui/use-toast";

type MessageHandler = (data: any) => void;
type EventType = 'bank_account_created' | 'bank_account_updated' | 'bank_account_deleted' | 
                 'account_login_created' | 'account_login_updated' | 'account_login_deleted' |
                 'connection_established';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectInterval = 5000; // 5 seconds
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventHandlers: Map<EventType, MessageHandler[]> = new Map();
  private url: string;
  private isConnecting = false;

  constructor() {
    // Use secure WebSocket if the site is on HTTPS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${protocol}//${window.location.hostname}:4000/ws`;
  }

  public connect(): void {
    if (this.isConnecting) return;
    
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    
    console.log('Connecting to WebSocket:', this.url);
    this.socket = new WebSocket(this.url);
    
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      
      // Send a ping to test the connection
      this.ping();
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        
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
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private ping(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('Sending ping to server');
      this.socket.send(JSON.stringify({ type: 'ping' }));
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
