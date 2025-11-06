import { type WebSocketMessage, ConnectionStatus } from '../types';
import { WS_URL, RECONNECT_INTERVAL } from '../config';

type MessageHandler = (message: WebSocketMessage) => void;
type StatusHandler = (status: ConnectionStatus) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectTimer: number | null = null;
  private currentStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private apiKey: string | null = null;
  private shouldReconnect: boolean = true;

  constructor() {
    console.log('WebSocketService створено');
  }

  connect(apiKey: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket вже підключено');
      return;
    }

    this.apiKey = apiKey;
    this.shouldReconnect = true;
    this.setStatus(ConnectionStatus.CONNECTING);

    try {
      console.log(`Підключення до ${WS_URL}...`);
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('✅ WebSocket підключено');
        this.setStatus(ConnectionStatus.CONNECTED);
        this.clearReconnectTimer();
        
        this.authenticate();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === 'auth_success') {
            this.setStatus(ConnectionStatus.AUTHENTICATED);
          } else if (message.type === 'auth_error') {
            if (message.message?.includes('Please authenticate')) {
              return;
            }
            
            this.setStatus(ConnectionStatus.ERROR);
            return;
          }

          this.notifyMessageHandlers(message);
        } catch (error) {
          console.error('Помилка парсингу повідомлення:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket помилка:', error);
        this.setStatus(ConnectionStatus.ERROR);
      };

      this.ws.onclose = (event) => {
        console.log('👋 WebSocket закрито:', event.code, event.reason);
        this.setStatus(ConnectionStatus.DISCONNECTED);
        this.ws = null;

        if (this.shouldReconnect && this.apiKey) {
          console.log(`Переподключення через ${RECONNECT_INTERVAL / 1000} сек...`);
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('Помилка створення WebSocket:', error);
      this.setStatus(ConnectionStatus.ERROR);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    console.log('Відключення від WebSocket...');
    this.shouldReconnect = false;
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setStatus(ConnectionStatus.DISCONNECTED);
  }

  private authenticate(): void {
    if (!this.apiKey) {
      console.error('API ключ не встановлено');
      return;
    }

    const authMessage: WebSocketMessage = {
      type: 'auth',
      apiKey: this.apiKey,
    };

    this.send(authMessage);
  }

  private send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const jsonMessage = JSON.stringify(message);
      this.ws.send(jsonMessage);
    } else {
      console.warn('⚠️ WebSocket не підключено (readyState:', this.ws?.readyState, '), неможливо надіслати:', message);
    }
  }

  ping(): void {
    this.send({ type: 'ping' });
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();

    this.reconnectTimer = setTimeout(() => {
      if (this.shouldReconnect && this.apiKey) {
        console.log('🔄 Спроба переподключення...');
        this.connect(this.apiKey);
      }
    }, RECONNECT_INTERVAL) as unknown as number;
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.notifyStatusHandlers(status);
    }
  }

  getStatus(): ConnectionStatus {
    return this.currentStatus;
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    handler(this.currentStatus);
    return () => this.statusHandlers.delete(handler);
  }

  private notifyMessageHandlers(message: WebSocketMessage): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('Помилка в message handler:', error);
      }
    });
  }

  private notifyStatusHandlers(status: ConnectionStatus): void {
    this.statusHandlers.forEach((handler) => {
      try {
        handler(status);
      } catch (error) {
        console.error('Помилка в status handler:', error);
      }
    });
  }
}

export const webSocketService = new WebSocketService();

