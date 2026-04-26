import { ScrollView, View } from 'react-native';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as React from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/clerk-expo';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ride, RideCard } from '@/components/ride-card';
import { haversineDistanceKM } from '@/lib/distance';

export default function ProposeScreen() {
  const [search, setSearch] = React.useState('');
  const [rides, setRides] = React.useState<Ride[]>([]);
  const { user } = useUser();
  const [location, setLocation] = React.useState<Location.LocationObject | null>(null);

  const filteredRides = React.useMemo(() => {
    if (!search) return rides
    return rides.filter((ride) =>
      ride.startingPoint.address.toLowerCase().includes(search.toLowerCase())
    )
  }, [search,rides])

  React.useEffect(() => {
    async function getCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission GPS refusée');
        return;
      }
      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        console.warn('Position indisponible');
      }
    }

    async function fetchRides() {
      const docs = await getDocs(collection(db, 'rides'));
      const fetched = docs.docs.map((doc) => ({
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
      }));

      const sorted = location
        ? fetched.sort(
            (a: Ride, b: Ride) =>
              haversineDistanceKM(a, location) - haversineDistanceKM(b, location)
          )
        : fetched;
      setRides(sorted);
    }

    fetchRides();
    getCurrentLocation();
  }, [location]);

  return (
    <ScrollView className="flex-1 p-4">
      <View className="gap-4">
        <View className="gap-1.5">
          <Label>Rechercher l'adresse</Label>
          <Input
            placeholder="Entrez l'adresse de départ"
            value={search}
            onChangeText={setSearch}
          />
          <View className="gap-3">
            {filteredRides.slice(0, 20).map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                distance={location ? haversineDistanceKM(ride, location) : undefined}
                onPress={() => {
                  router.navigate({
                    pathname: '/(tabs)',
                    params: { selectedRideId: ride.id }
                  })
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}