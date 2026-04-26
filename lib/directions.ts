import { decode } from '@mapbox/polyline';

type Coordinates = { latitude: number; longitude: number };

export async function fetchRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<{ coords: Coordinates[]; duration: string } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${process.env.EXPO_PUBLIC_MAPS_API_KEY}`
    );
    const data = await response.json();
    if (!data.routes?.length) return null;

    const points = decode(data.routes[0].overview_polyline.points);
    const coords = points.map(([latitude, longitude]: [number, number]) => ({
      latitude: latitude,
      longitude: longitude,
    }));
    const minutes = Math.round(data.routes[0].legs[0].duration.value / 60);

    return { coords, duration: `${minutes} min` };
  } catch {
    return null;
  }
}
