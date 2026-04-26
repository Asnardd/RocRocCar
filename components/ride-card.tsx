import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Timestamp } from 'firebase/firestore';

export type Ride = {
  id: string;
  createdAt: Timestamp;
  date: Timestamp;
  driverId: string;
  seats: number;
  seatsAvailable: number;
  startingPoint: {
    address: string;
    latitude: number;
    longitude: number;
  };
};

export function RideCard({ ride, distance, onPress }: { ride: Ride; distance?: number; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="gap-1 rounded-xl border border-border p-3">
      <Text className="font-semibold">{ride.startingPoint.address}</Text>
      <Text className="text-sm text-muted-foreground">
        {ride.date.toLocaleString()} {distance ? `— ${distance.toFixed(2)} km de vous` : ''}
      </Text>
      <Text className="text-sm">
        {ride.seatsAvailable} place{ride.seatsAvailable > 1 ? 's' : ''} disponible
        {ride.seatsAvailable > 1 ? 's' : ''}
      </Text>
    </Pressable>
  );
}
