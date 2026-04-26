import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { getDoc, Timestamp } from 'firebase/firestore';
import { doc } from '@firebase/firestore';
import { db } from '@/lib/firebase';
import React, { useState } from 'react';
import { User } from 'components/user-card'

export type Ride = {
  id: string;
  direction: string;
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

async function getDriver(id: string): Promise<User | null> {
  const document = await getDoc(doc(db, 'users', id));
  if (!document.exists()) {
    return null;
  }
  return {
    id: document.id,
    email: document.data().email,
    name: document.data().name,
    avatar: document.data().avatar,
  };
}

export function RideCard({ ride, distance, onPress }: { ride: Ride; distance?: number; onPress?: () => void }) {
  const [driverName, setDriverName] = React.useState<string>();

  React.useEffect(()=> {
    getDriver(ride.driverId).then((driver) => {
      setDriverName(driver ? driver.name : 'Utilisateur Inconnu');
    })
  }, [ride.driverId])

  return (
    <Pressable onPress={onPress} className="gap-1 rounded-xl border border-border p-3">
      <Text className="font-semibold">{ride.startingPoint.address}</Text>
      <Text className="text-sm text-muted-foreground">
        {ride.date.toLocaleString()} {distance ? `— ${distance.toFixed(2)} km de vous` : ''}
      </Text>
      <Text className="text-sm">
        {ride.seatsAvailable} place{ride.seatsAvailable > 1 ? 's' : ''} disponible
        {ride.seatsAvailable > 1 ? 's' : ''}
        <Text className="text-muted-foreground text-xs">
          {' '} — Proposé par {driverName}
        </Text>
      </Text>
    </Pressable>
  );
}
