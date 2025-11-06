import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useObjectsStore } from '../../stores/RootStore';
import { ObjectMarker } from './ObjectMarker';
import { type TrackedObject } from '../../types';

const KYIV_CENTER: [number, number] = [50.4501, 30.5234];
const DEFAULT_ZOOM = 12;

const FitBounds = observer(() => {
  const objectsStore = useObjectsStore();
  const map = useMap();
  const [hasFitted, setHasFitted] = useState(false);

  useEffect(() => {
    if (!hasFitted && objectsStore.objectsArray.length > 0) {
      const bounds = objectsStore.objectsArray.map((obj) => [
        obj.latitude,
        obj.longitude,
      ] as [number, number]);
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
        setHasFitted(true);
      }
    }
  }, [objectsStore.objectsArray.length, map, hasFitted]);

  return null;
});

const CenterOnObject = ({ object }: { object: TrackedObject | null }) => {
  const map = useMap();

  useEffect(() => {
    if (object) {
      map.setView([object.latitude, object.longitude], 15, { animate: true });
    }
  }, [object, map]);

  return null;
};

const InvalidateSize = ({ trigger }: { trigger: boolean }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 1);
    return () => clearTimeout(timer);
  }, [trigger, map]);

  return null;
};

interface MapViewProps {
  selectedObject?: TrackedObject | null;
  drawerOpen?: boolean;
}

export const MapView = observer(({ selectedObject, drawerOpen = true }: MapViewProps) => {
  const objectsStore = useObjectsStore();

  if (objectsStore.totalCount === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Очікування об'єктів з сервера...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={KYIV_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds />
        <CenterOnObject object={selectedObject || null} />
        <InvalidateSize trigger={drawerOpen} />

        {objectsStore.objectsArray.map((obj) => (
          <ObjectMarker key={obj.id} object={obj} />
        ))}
      </MapContainer>

      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          backgroundColor: 'white',
          padding: '8px 16px',
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 1000,
        }}
      >
        <Typography variant="caption" component="div">
          <strong>Всього:</strong> {objectsStore.totalCount}
        </Typography>
        <Typography variant="caption" component="div" color="success.main">
          <strong>Активні:</strong> {objectsStore.activeCount}
        </Typography>
        <Typography variant="caption" component="div" color="warning.main">
          <strong>Втрачені:</strong> {objectsStore.lostCount}
        </Typography>
      </Box>
    </Box>
  );
});

