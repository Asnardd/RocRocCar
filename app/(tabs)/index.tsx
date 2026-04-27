import { useUser } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { db } from '@/lib/firebase';
import { addDoc, collection, getDoc, getDocs } from 'firebase/firestore';
import MapView, { MapMarker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Column, Host, ModalBottomSheet, ModalBottomSheetRef, RNHostView, } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';
import { Ride, RideCard } from '@/components/ride-card';
import { haversineDistanceKM } from '@/lib/distance';
import { fetchRoute } from '@/lib/directions';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { doc, setDoc } from '@firebase/firestore';
import Toast from 'react-native-toast-message';

export default function Screen() {
  const [sheetVisibility, setSheetVisibility] = React.useState(false);
  const [rides, setRides] = React.useState<any[]>([]);
  const sheetRef = React.useRef<ModalBottomSheetRef>(null);
  const { user } = useUser();
  const [location, setLocation] = React.useState<Location.LocationObject | null>(null);
  const mapRef = React.useRef<MapView>(null);
  const [selectedRideId, setSelectedRideId] = React.useState<string | null>(null);
  const { selectedRideId: paramRideId } = useLocalSearchParams<{ selectedRideId: string }>();
  const [rideDuration, setRideDuration] = React.useState<string | null>(null);
  const [toPickupDuration, setToPickupDuration] = React.useState<string | null>(null);
  const [showDirections, setShowDirections] = React.useState(false);
  const [rideCoords, setRideCoords] = React.useState<any[]>([]);
  const [pickupCoords, setPickupCoords] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [mapKey, setMapKey] = React.useState('map-default');
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
  const LE_ROC = { latitude: 46.684734006166956, longitude: -1.419224168171691 };

  const hideSheet = async () => {
    await sheetRef.current?.hide();
    setSheetVisibility(false);
  };

  async function subscribeToRide(rideId: string) {
    try {
      const rideDoc = await getDoc(doc(db, 'rides', rideId));
      await addDoc(collection(db, 'rides', rideId, 'passengers'), {
        userId: user?.id,
        joinedAt: new Date(),
      });
      setDoc(
        doc(db,'rides',rideId),
        {
          seatsAvailable:0
        },
        {merge:true}
      );
      Toast.show({
        type: 'success',
        text1: 'Vous êtes désormais inscrit à ce trajet!',
        text2: 'Envoyez un message au conducteur pour vous préparer!'
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Une erreur s\'est produite lors de l\'inscription au trajet',
        text2: error instanceof Error ? error.message : 'Veuillez réessayer plus tard'
      })
    } finally {
      setLoading(false);
    }
  }

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
        direction: doc.data().direction,
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

      const filtered = rides.filter((ride) => ride.seatsAvailable > 0); // Aussi ajouter "&& ride.date > new Date()" en prod, retirer actuellement pour les tests

      const sorted = location
        ? filtered.sort(
            (a: Ride, b: Ride) =>
              haversineDistanceKM(a, location) - haversineDistanceKM(b, location)
          )
        : filtered;
      setRides(sorted);
    }

    fetchRides();
    getCurrentLocation();
  }, [location]);

  React.useEffect(() => {
    if (!paramRideId) return;
    const ride = rides.find((ride) => ride.id === paramRideId);
    if (!ride || !mapRef.current) return;
    setSelectedRideId(paramRideId);
    setShowDirections(true);
    mapRef.current.animateToRegion(
      {
        latitude: ride.startingPoint.latitude,
        longitude: ride.startingPoint.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      500
    );

    async function loadRoutes() {
      const [rideRoute, pickupRoute] = await Promise.all([
        fetchRoute(ride.startingPoint, LE_ROC),
        location ? fetchRoute(location.coords, ride.startingPoint, 'walking') : null,
      ]);
      if (rideRoute) {
        setRideCoords(rideRoute.coords);
        setRideDuration(rideRoute.duration);
      }
      if (pickupRoute) {
        setPickupCoords(pickupRoute.coords);
        setToPickupDuration(pickupRoute.duration);
      }
    }

  loadRoutes();
  }, [paramRideId, rides]);

  return (
    <>
      {/*<Button className="absolute bottom-4 right-4" onPress={() => setSheetVisibility(true)}>*/}
      {/*  <Text>Proposer</Text>*/}
      {/*</Button>*/}
      <MapView
        key={mapKey}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        initialRegion={{
          latitude: 46.684734006166956,
          longitude: -1.419224168171691,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation>
        <MapMarker title="Notre Dame du Roc" coordinate={LE_ROC} />
        {rides
          ? rides.map((ride) => (
              <MapMarker
                pinColor={
                  ride.id == selectedRideId
                    ? 'red'
                    : ride.direction === 'to_school'
                      ? 'green'
                      : 'blue'
                }
                key={ride.id}
                title={ride.startingPoint.address}
                coordinate={{
                  latitude: ride.startingPoint.latitude,
                  longitude: ride.startingPoint.longitude,
                }}
              />
            ))
          : null}

        {showDirections && rideCoords.length > 0 && (
          <Polyline
            coordinates={
              showDirections && rideCoords.length > 0
                ? rideCoords
                : [
                    { latitude: 0, longitude: 0 },
                    { latitude: 0, longitude: 0 },
                  ]
            }
            strokeColor={showDirections ? '#6366f1' : 'transparent'}
            strokeWidth={4}
          />
        )}
        {showDirections && pickupCoords.length > 0 && (
          <Polyline
            coordinates={
              showDirections && pickupCoords.length > 0
                ? pickupCoords
                : [
                    { latitude: 0, longitude: 0 },
                    { latitude: 0, longitude: 0 },
                  ]
            }
            strokeColor={showDirections ? '#f97316' : 'transparent'}
            strokeWidth={3}
            lineDashPattern={[6, 4]}
          />
        )}
      </MapView>
      <View className="absolute bottom-16 left-0 right-0 items-center">
        <Pressable
          onPress={() => setSheetVisibility(true)}
          className="items-center rounded-full bg-background px-8 py-3 shadow-lg">
          <View className="mb-2 h-1 w-10 rounded-full bg-muted-foreground" />
          <Text className="text-sm text-muted-foreground">Voir les trajets</Text>
        </Pressable>
      </View>
      <View className="absolute inset-0" pointerEvents={selectedRideId ? 'auto' : 'none'}>
        {selectedRideId && (
          <Pressable
            className="absolute left-5 top-4 rounded-full bg-background px-4 py-2"
            onPress={() => {
              setSelectedRideId(null);
              setShowDirections(false);
              setRideCoords([]);
              setPickupCoords([]);
              setRideDuration(null);
              setToPickupDuration(null);
              setMapKey(`map-${Date.now()}`);
              router.setParams({ selectedRideId: undefined });
            }}>
            <Text className="text-sm">✕ Arrêter le focus</Text>
          </Pressable>
        )}
      </View>

      {selectedRideId && (rideDuration || toPickupDuration) && (
        <View className="absolute left-2 right-0 top-16 gap-1 rounded-xl bg-background p-3">
          {toPickupDuration && (
            <Text className="text-sm">
              <MaterialIcons size={16} name={'nordic-walking'} /> {toPickupDuration} jusqu'au point
              de départ
            </Text>
          )}
          {rideDuration && (
            <Text className="text-sm">
              <MaterialIcons size={16} name={'directions-car'} /> {rideDuration} vers Le Roc
            </Text>
          )}
          <Button
            className="w-lg self-center"
            onPress={()=> {
              setLoading(true);
              subscribeToRide(selectedRideId)
              setSelectedRideId(null);
              setShowDirections(false);
              setRideCoords([]);
              setPickupCoords([]);
              setRideDuration(null);
              setToPickupDuration(null);
              setLoading(false);
              setMapKey(`map-${Date.now()}`);
              router.setParams({ selectedRideId: undefined });
            }}
          >
          <Text>S'inscrire au trajet</Text>
          </Button>
        </View>
      )}

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
                      rides.slice(0, 5).map((ride) => (
                        <RideCard
                          key={ride.id}
                          ride={ride}
                          distance={haversineDistanceKM(ride, location)}
                          onPress={() => {
                            setSheetVisibility(false);
                            router.navigate({
                              pathname: '/(tabs)',
                              params: { selectedRideId: ride.id },
                            });
                          }}
                        />
                      ))
                    )}
                  </View>

                  <View className="flex-row gap-3">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onPress={() => {
                        setSheetVisibility(false);
                        router.push('/search-rides');
                      }}>
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

