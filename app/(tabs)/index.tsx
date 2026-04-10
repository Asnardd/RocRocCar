import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import MapView, { MapMarker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Column, Host, ModalBottomSheet, ModalBottomSheetRef, RNHostView, } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';
import { Ride, RideCard } from '@/components/ride-card';

export default function Screen() {
  const [sheetVisibility, setSheetVisibility] = React.useState(false);
  const [rides, setRides] = React.useState<any[]>([]);
  const sheetRef = React.useRef<ModalBottomSheetRef>(null);
  const { user } = useUser();
  const [location, setLocation] = React.useState<Location.LocationObject | null>(null);
  const insets = useSafeAreaInsets();
  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFill,
      height: '100%',
      width: '100%',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
    },
    map: {
      ...StyleSheet.absoluteFill,
    },
  });

  // Formula taken from stackoverflow - https://stackoverflow.com/a/14561433
  function haversineDistanceKM(ride: Ride, location: Location.LocationObject | null) {
    function toRad(degree: number) {
      return (degree * Math.PI) / 180;
    }

    const lat1 = toRad(location!.coords.latitude);
    const lon1 = toRad(location!.coords.longitude);
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

  const hideSheet = async () => {
    await sheetRef.current?.hide();
    setSheetVisibility(false);
  };

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
      const rides = docs.docs.map((doc) => ({
        id: doc.id,
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
        ? rides.sort(
            (a: Ride, b: Ride) =>
              haversineDistanceKM(
                a,
                location
              ) -
              haversineDistanceKM(
                b,
                location
              )
          )
        : rides;
      setRides(sorted);
    }

    fetchRides();
    getCurrentLocation();
  }, [location]);

  return (
    <>
      {/*<Button className="absolute bottom-4 right-4" onPress={() => setSheetVisibility(true)}>*/}
      {/*  <Text>Proposer</Text>*/}
      {/*</Button>*/}
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 46.684734006166956,
          longitude: -1.419224168171691,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation>
        <MapMarker
          title="Notre Dame du Roc"
          coordinate={{
            latitude: 46.684734006166956,
            longitude: -1.419224168171691,
          }}
        />
        {rides ? rides.map((ride) => (
          <MapMarker
            pinColor={'purple'}
            key={ride.id}
            title={ride.startingPoint.address}
            coordinate={{
              latitude: ride.startingPoint.latitude,
              longitude: ride.startingPoint.longitude,
            }}
          />
        )) : null}
      </MapView>
      <View className="absolute bottom-16 left-0 right-0 items-center">
        <Pressable
          onPress={() => setSheetVisibility(true)}
          className="items-center rounded-full bg-background px-8 py-3 shadow-lg">
          <View className="mb-2 h-1 w-10 rounded-full bg-muted-foreground" />
          <Text className="text-sm text-muted-foreground">Voir les trajets</Text>
        </Pressable>
      </View>

      <Host>
        {sheetVisibility && (
          <ModalBottomSheet
            ref={sheetRef}
            onDismissRequest={() => setSheetVisibility(false)}
            skipPartiallyExpanded={false}>
            <Column modifiers={[paddingAll(0)]}>
              <RNHostView>
                <View className="gap-4 p-4">
                  <Text className="text-lg font-bold">Trajets proches</Text>

                  <View className="gap-3">
                    {rides.length === 0 ? (
                      <Text className="text-sm text-muted-foreground">Aucun trajet disponible</Text>
                    ) : (
                      rides
                        .slice(0, 5)
                        .map((ride) => (
                          <RideCard
                            key={ride.id}
                            ride={ride}
                            distance={haversineDistanceKM(ride, location)}
                          />
                        ))
                    )}
                  </View>

                  <View className="flex-row gap-3">
                    <Button className="flex-1" variant="outline" onPress={() => {}}>
                      <Text>Rechercher</Text>
                    </Button>
                    <Button
                      className="flex-1"
                      onPress={() => {
                        setSheetVisibility(false);
                        router.push('/propose');
                      }}>
                      <Text>Proposer</Text>
                    </Button>
                  </View>
                </View>
              </RNHostView>
            </Column>
          </ModalBottomSheet>
        )}
      </Host>
    </>
  );
}

