import { UserMenu } from '@/components/user-menu';
import { useUser } from '@clerk/clerk-expo';
import { router, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import MapView, { MapMarker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
export default function Screen() {
  const { colorScheme } = useColorScheme();
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
      ...StyleSheet.absoluteFill
    },
  })

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

    getCurrentLocation();
  });
  

  return (
    <>
      <Button
        className="absolute bottom-4 right-4"
        onPress={() => {router.push('/propose')}}
      >
        <Text>Proposer</Text>
      </Button>
      {/*<MapView*/}
      {/*  style={StyleSheet.absoluteFill}*/}
      {/*  provider={PROVIDER_GOOGLE}*/}
      {/*  initialRegion={{*/}
      {/*    latitude: 46.684734006166956,*/}
      {/*    longitude: -1.419224168171691,*/}
      {/*    latitudeDelta: 0.05,*/}
      {/*    longitudeDelta: 0.05,*/}
      {/*  }}*/}
      {/*  showsUserLocation*/}
      {/*>*/}
      {/*  <MapMarker*/}
      {/*    title="Notre Dame du Roc"*/}
      {/*    coordinate={{*/}
      {/*    latitude: 46.684734006166956,*/}
      {/*    longitude: -1.419224168171691*/}
      {/*  }}*/}
      {/*  />*/}
      {/*</MapView>*/}
    </>
  );
}

