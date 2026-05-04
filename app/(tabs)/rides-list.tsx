import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { UserMenu } from '@/components/user-menu';
import { useUser } from '@clerk/clerk-expo';
import { Link, router, Stack } from 'expo-router';
import { MoonStarIcon, XIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, ScrollView, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import firebase from 'firebase/compat/app';
import { User } from 'components/user-card';
import { UserCard } from '@/components/user-card';
import { Label } from '@/components/ui/label';
import * as Location from 'expo-location';
import { Ride, RideCard } from '@/components/ride-card';
import { haversineDistanceKM } from '@/lib/distance';

export default function Screen() {
  const [rides, setRides] = React.useState<Ride[]>([]);
  const { user } = useUser();

  React.useEffect(() => {
    async function fetchRides() {
      const docs = await getDocs(collection(db, 'rides'));

      const fetched = await Promise.all(
        docs.docs.map(async (doc) => {
          const passengersDocs = await getDocs(collection(db, 'rides', doc.id, 'passengers'));

          const passengers = passengersDocs.docs.map((passenger) => ({
            id: passenger.id,
            userId: passenger.data().userId,
            joinedAt: passenger.data().joinedAt.toDate(),
          }));

          return {
            id: doc.id,
            direction: doc.data().direction,
            createdAt: doc.data().createdAt.toDate(),
            driverId: doc.data().driverId,
            seats: doc.data().seats,
            seatsAvailable: doc.data().seatsAvailable,
            startingPoint: {
              address: doc.data().startingPoint.address,
              latitude: doc.data().startingPoint.latitude,
              longitude: doc.data().startingPoint.longitude,
            },
            date: doc.data().date.toDate(),
            passengers,
          };
        })
      );

      setRides(fetched);
    }

    fetchRides();
  }, []);

  return (
    <>
      <ScrollView className="gap-4 p-4">
        <View className="gap-2 mb-5">
          {rides.length > 0 ? (
            rides.map((ride) => (
              <RideCard
                ride={ride}
                key={ride.id}
                onPress={() => {
                  router.navigate({
                    pathname: '/(tabs)',
                    params: { selectedRideId: ride.id },
                  });
                }}
              />
            ))
          ) : (
            <Text>Aucun trajet disponible pour le moment.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}
