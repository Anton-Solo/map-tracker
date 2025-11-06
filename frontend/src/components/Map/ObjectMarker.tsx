import { useMemo, memo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { type TrackedObject } from '../../types';

interface ObjectMarkerProps {
  object: TrackedObject;
}

const STATUS_COLORS = {
  active: '#4caf50', 
  lost: '#ff9800',  
};

const createDirectionIcon = (direction: number, status: 'active' | 'lost'): DivIcon => {
  const color = STATUS_COLORS[status];
  
  return new DivIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        position: relative;
        transform: rotate(${direction}deg);
      ">
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" fill="rgba(0,0,0,0.2)" />
          
          <circle cx="15" cy="14" r="11" fill="${color}" stroke="white" stroke-width="2"/>
          
          <path 
            d="M 15 5 L 18 12 L 15 10 L 12 12 Z" 
            fill="white" 
            stroke="white" 
            stroke-width="1"
          />
        </svg>
        
        ${status === 'active' ? `
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: ${color};
            opacity: 0.4;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
      </div>
      
      <style>
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.2;
          }
          100% {
            transform: scale(1);
            opacity: 0.4;
          }
        }
      </style>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

export const ObjectMarker = memo(({ object }: ObjectMarkerProps) => {
  const icon = useMemo(
    () => createDirectionIcon(object.direction, object.status),
    [object.direction, object.status]
  );

  const position: [number, number] = [object.latitude, object.longitude];

  const lastUpdateTime = new Date(object.lastUpdate).toLocaleTimeString('uk-UA');

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div style={{ minWidth: '200px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
            {object.id}
          </h3>
          
          <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
            <div>
              <strong>Статус:</strong>{' '}
              <span
                style={{
                  color: STATUS_COLORS[object.status],
                  fontWeight: 'bold',
                }}
              >
                {object.status === 'active' ? '🟢 Активний' : '🟡 Втрачений'}
              </span>
            </div>
            
            <div>
              <strong>Координати:</strong>
              <br />
              {object.latitude.toFixed(6)}, {object.longitude.toFixed(6)}
            </div>
            
            <div>
              <strong>Напрям:</strong> {object.direction}°
            </div>
            
            <div>
              <strong>Швидкість:</strong> {object.speed.toFixed(1)} км/год
            </div>
            
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
              <strong>Останнє оновлення:</strong>
              <br />
              {lastUpdateTime}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}, (prevProps: ObjectMarkerProps, nextProps: ObjectMarkerProps) => {
  return (
    prevProps.object.id === nextProps.object.id &&
    prevProps.object.latitude === nextProps.object.latitude &&
    prevProps.object.longitude === nextProps.object.longitude &&
    prevProps.object.direction === nextProps.object.direction &&
    prevProps.object.status === nextProps.object.status
  );
});

