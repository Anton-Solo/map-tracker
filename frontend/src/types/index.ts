export interface TrackedObject {
  id: string;
  latitude: number;
  longitude: number;
  direction: number;
  speed: number;
  status: 'active' | 'lost';
  lastUpdate: string;
}

export interface WebSocketMessage {
  type: 'auth' | 'auth_success' | 'auth_error' | 'objects_update' | 'ping' | 'pong';
  apiKey?: string;
  message?: string;
  objects?: TrackedObject[];
  timestamp?: number;
}

export const ConnectionStatus = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error',
} as const;

export type ConnectionStatus = (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

export interface AppConfig {
  wsUrl: string;
  apiKey: string | null;
}

