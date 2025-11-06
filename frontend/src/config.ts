export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
export const LOST_OBJECT_TIMEOUT = parseInt(import.meta.env.VITE_LOST_OBJECT_TIMEOUT || '30000', 10);
export const REMOVE_OBJECT_TIMEOUT = parseInt(import.meta.env.VITE_REMOVE_OBJECT_TIMEOUT || '300000', 10);
export const RECONNECT_INTERVAL = parseInt(import.meta.env.VITE_RECONNECT_INTERVAL || '3000', 10);
export const API_KEY_STORAGE_KEY = 'map-tracker-api-key';

