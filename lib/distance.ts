import { Ride } from '@/components/ride-card';
import * as Location from 'expo-location';

// Formula taken from stackoverflow - https://stackoverflow.com/a/14561433
export function haversineDistanceKM(ride: Ride, location: Location.LocationObject | null) {
  if (!location) return Infinity;

  function toRad(degree: number) {
    return (degree * Math.PI) / 180;
  }

  const lat1 = toRad(location.coords.latitude);
  const lon1 = toRad(location.coords.longitude);
  const lat2 = toRad(ride.startingPoint.latitude);
  const lon2 = toRad(ride.startingPoint.longitude);

  const { sin, cos, sqrt, atan2 } = Math;

  const R = 6371; // earth radius in km
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const a = sin(dLat / 2) * sin(dLat / 2) + cos(lat1) * cos(lat2) * sin(dLon / 2) * sin(dLon / 2);
  const c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return R * c; // distance in km
}
