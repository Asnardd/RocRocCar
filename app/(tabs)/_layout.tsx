import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name={'index'}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name={'house'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={'ride-form'}
        options={{
          title: 'Create a Ride',
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name={'add-road'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}