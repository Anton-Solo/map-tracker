import { WebSocket } from 'ws';

export interface TrackedObject {
  id: string;
  latitude: number;
  longitude: number;
  direction: number;
  speed: number;
  status: 'active' | 'lost';
  lastUpdate: Date;
}

export interface SerializedTrackedObject {
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
  objects?: SerializedTrackedObject[];
  timestamp?: number;
}

export interface AuthenticatedClient {
  ws: WebSocket;
  apiKey: string;
  id: string;
}

