import { TrackedObject } from './types.js';

const KIEV_CENTER = {
  lat: 50.4501,
  lng: 30.5234,
};

const AREA_RADIUS = 0.15;

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateRandomCoordinates(): { latitude: number; longitude: number } {
  const angle = Math.random() * 2 * Math.PI;
  const radius = Math.random() * AREA_RADIUS;

  return {
    latitude: KIEV_CENTER.lat + radius * Math.cos(angle),
    longitude: KIEV_CENTER.lng + radius * Math.sin(angle),
  };
}

export function generateObject(id: number): TrackedObject {
  const coords = generateRandomCoordinates();

  return {
    id: `OBJ-${String(id).padStart(4, '0')}`,
    latitude: coords.latitude,
    longitude: coords.longitude,
    direction: Math.floor(Math.random() * 360),
    speed: randomInRange(10, 50),
    status: 'active',
    lastUpdate: new Date(),
  };
}

export function generateInitialObjects(count: number): Map<string, TrackedObject> {
  const objects = new Map<string, TrackedObject>();

  for (let i = 1; i <= count; i++) {
    const obj = generateObject(i);
    objects.set(obj.id, obj);
  }

  return objects;
}

export function updateObjectPosition(obj: TrackedObject, deltaTimeSeconds: number): TrackedObject {
  const kmToDegreesLat = 1 / 111;
  const kmToDegreesLng = 1 / (111 * Math.cos((obj.latitude * Math.PI) / 180));

  const distanceKm = (obj.speed * deltaTimeSeconds) / 3600;

  const directionRad = (obj.direction * Math.PI) / 180;

  const newLatitude = obj.latitude + distanceKm * Math.cos(directionRad) * kmToDegreesLat;
  const newLongitude = obj.longitude + distanceKm * Math.sin(directionRad) * kmToDegreesLng;

  const distanceFromCenter = Math.sqrt(
    Math.pow(newLatitude - KIEV_CENTER.lat, 2) + Math.pow(newLongitude - KIEV_CENTER.lng, 2)
  );

  let finalLat = newLatitude;
  let finalLng = newLongitude;
  let finalDirection = obj.direction;

  if (distanceFromCenter > AREA_RADIUS) {
    finalDirection = (obj.direction + 180) % 360;
  }

  if (Math.random() < 0.1) {
    finalDirection = (finalDirection + randomInRange(-30, 30) + 360) % 360;
  }

  let finalSpeed = obj.speed;
  if (Math.random() < 0.05) {
    finalSpeed = randomInRange(10, 50);
  }

  return {
    ...obj,
    latitude: finalLat,
    longitude: finalLng,
    direction: Math.floor(finalDirection),
    speed: finalSpeed,
    lastUpdate: new Date(),
  };
}

export function shouldLoseObject(): boolean {
  return Math.random() < 0.02;
}

export function shouldRecoverObject(): boolean {
  return Math.random() < 0.1;
}

