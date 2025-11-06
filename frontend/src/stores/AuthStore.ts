import { makeAutoObservable, runInAction } from 'mobx';
import { webSocketService } from '../services/WebSocketService';
import { ConnectionStatus } from '../types';
import { API_KEY_STORAGE_KEY } from '../config';

export class AuthStore {
  apiKey: string | null = null;
  isAuthenticated: boolean = false;
  connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadApiKeyFromStorage();
    this.setupWebSocketListeners();
  }

  private loadApiKeyFromStorage(): void {
    try {
      const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedKey) {
        console.log('✅ API ключ завантажено з localStorage');
        this.apiKey = savedKey;
      }
    } catch (error) {
      console.error('Помилка завантаження API ключа:', error);
    }
  }

  private saveApiKeyToStorage(apiKey: string): void {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      console.log('✅ API ключ збережено в localStorage');
    } catch (error) {
      console.error('Помилка збереження API ключа:', error);
    }
  }

  private removeApiKeyFromStorage(): void {
    try {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      console.log('✅ API ключ видалено з localStorage');
    } catch (error) {
      console.error('Помилка видалення API ключа:', error);
    }
  }

  private setupWebSocketListeners(): void {
    webSocketService.onStatusChange((status) => {
      runInAction(() => {
        this.connectionStatus = status;
        this.isAuthenticated = status === ConnectionStatus.AUTHENTICATED;

        if (status === ConnectionStatus.ERROR) {
          this.error = 'Помилка підключення або авторизації';
        } else {
          this.error = null;
        }
      });
    });

    webSocketService.onMessage((message) => {
      if (message.type === 'auth_error') {
        if (message.message?.includes('Please authenticate')) {
          return;
        }
        runInAction(() => {
          this.error = message.message || 'Невірний API ключ';
        });
      }
    });
  }

  login(apiKey: string): void {
    if (!apiKey || apiKey.trim() === '') {
      this.error = 'API ключ не може бути порожнім';
      return;
    }

    this.error = null;
    this.apiKey = apiKey.trim();
    this.saveApiKeyToStorage(this.apiKey);

    console.log('🔑 Спроба авторизації...');
    webSocketService.connect(this.apiKey);
  }

  logout(): void {
    console.log('👋 Вихід з системи');
    
    this.apiKey = null;
    this.isAuthenticated = false;
    this.error = null;
    this.removeApiKeyFromStorage();
    
    webSocketService.disconnect();
  }

  reconnect(): void {
    if (this.apiKey) {
      console.log('🔄 Переподключення...');
      webSocketService.connect(this.apiKey);
    }
  }

  autoLogin(): void {
    if (this.apiKey && !this.isAuthenticated) {
      console.log('🔐 Автоматична авторизація...');
      this.login(this.apiKey);
    }
  }

  get isConnecting(): boolean {
    return this.connectionStatus === ConnectionStatus.CONNECTING;
  }

  get isConnected(): boolean {
    return this.connectionStatus === ConnectionStatus.CONNECTED ||
           this.connectionStatus === ConnectionStatus.AUTHENTICATED;
  }

  get statusText(): string {
    switch (this.connectionStatus) {
      case ConnectionStatus.DISCONNECTED:
        return 'Відключено';
      case ConnectionStatus.CONNECTING:
        return 'Підключення...';
      case ConnectionStatus.CONNECTED:
        return 'Підключено';
      case ConnectionStatus.AUTHENTICATED:
        return 'Авторизовано';
      case ConnectionStatus.ERROR:
        return 'Помилка';
      default:
        return 'Невідомо';
    }
  }
}

