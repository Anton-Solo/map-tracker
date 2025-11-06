/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WS_URL: string;
  readonly VITE_LOST_OBJECT_TIMEOUT: string;
  readonly VITE_REMOVE_OBJECT_TIMEOUT: string;
  readonly VITE_RECONNECT_INTERVAL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module 'leaflet' {
  export type LatLngExpression = [number, number] | { lat: number; lng: number };
  export type LatLngBoundsExpression = LatLngExpression[];
  
  export class DivIcon {
    constructor(options: {
      className?: string;
      html?: string;
      iconSize?: [number, number];
      iconAnchor?: [number, number];
      popupAnchor?: [number, number];
    });
  }

  export interface Map {
    setView(center: LatLngExpression, zoom: number, options?: { animate?: boolean }): this;
    fitBounds(bounds: LatLngBoundsExpression, options?: { padding?: [number, number] }): this;
    invalidateSize(options?: boolean | { animate?: boolean; pan?: boolean }): this;
  }
}

declare module 'react-leaflet' {
  import { ReactNode } from 'react';
  import type { Map as LeafletMap, DivIcon, LatLngExpression } from 'leaflet';

  export interface MapContainerProps {
    center?: LatLngExpression;
    zoom?: number;
    style?: React.CSSProperties;
    zoomControl?: boolean;
    children?: ReactNode;
  }

  export interface TileLayerProps {
    url?: string;
    attribution?: string;
  }

  export interface MarkerProps {
    position?: LatLngExpression;
    icon?: DivIcon;
    children?: ReactNode;
  }

  export interface PopupProps {
    children?: ReactNode;
  }

  export const MapContainer: React.FC<MapContainerProps>;
  export const TileLayer: React.FC<TileLayerProps>;
  export const Marker: React.FC<MarkerProps>;
  export const Popup: React.FC<PopupProps>;
  export function useMap(): LeafletMap;
}

