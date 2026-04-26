import { ScrollView, View } from 'react-native';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as React from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/clerk-expo';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export default function ProposeScreen() {
  const [address, setAddress] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [seats, setSeats] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { user } = useUser();
  const [direction, setDirection] = React.useState<'to_school' | 'from_school'>('to_school');


  function openDatePicker() {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'date',
      is24Hour: true,
      minimumDate: new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === 'dismissed' || !selectedDate) return;
        DateTimePickerAndroid.open({
          value: selectedDate,
          mode: 'time',
          is24Hour: true,
          onChange: (event2, selectedTime) => {
            if (event2.type === 'dismissed' || !selectedTime) return;
            setDate(selectedTime);
          },
        });
      },
    });
  }

  async function onSubmit() {
    if (!address || !date || seats <= 0) {
      setError('Tout les champs sont requis');
      return;
    }
    setLoading(true)
    try {
      const geocoded = await Location.geocodeAsync(address);
      await addDoc(collection(db, 'rides'), {
        date: Timestamp.fromDate(date),
        driverId: user?.id,
        seats,
        seatsAvailable: seats,
        startingPoint: {
          address,
          latitude: geocoded[0]?.latitude,
          longitude: geocoded[0]?.longitude,
        },
        createdAt: Timestamp.now(),
      });
      console.log('Trajet ajouté à Firestore');
      router.back()
    } catch (err) {
      setError('Erreur lors de la création du trajet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 p-4">
      <View className="mb-5 mt-4 flex-row gap-3">
        <Button
          variant={direction == 'to_school' ? 'default' : 'outline'}
          onPress={() => setDirection('to_school')}
          className={'flex-1'}>
          <Text>{'->'} Vers Le Roc</Text>
        </Button>
        <Button
          variant={direction == 'from_school' ? 'default' : 'outline'}
          onPress={() => setDirection('from_school')}
          className={'flex-1'}>
          <Text>{'<-'} Depuis Le Roc</Text>
        </Button>
      </View>
      <View className="gap-4">
        <View className="gap-1.5">
          <Label>Adresse de départ</Label>
          <Input
            placeholder="Entrez l'adresse de départ"
            value={address}
            onChangeText={setAddress}
          />
        </View>
        <View className="gap-1.5">
          <Label>Date et heure de départ</Label>
          <Button variant="outline" onPress={openDatePicker}>
            <Text>{date.toLocaleString('fr-FR')}</Text>
          </Button>
        </View>
        <View className={'gap-1.5'}>
          <Label>Nombre de places disponibles</Label>
          <Input
            inputMode="numeric"
            placeholder="3"
            keyboardType="number-pad"
            value={seats > 0 ? String(seats) : ''}
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              if (!isNaN(num)) {
                setSeats(num);
              }
            }}
          />
        </View>
        <Button onPress={onSubmit} disabled={loading}>
          <Text>{loading ? 'Création...' : 'Proposer un trajet'}</Text>
        </Button>
      </View>
    </ScrollView>
  );
}