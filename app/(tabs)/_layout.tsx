import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { UserMenu } from '@/components/user-menu';
import ThemeToggle from '@/components/theme-toggle';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name={'index'}
        options={{
          title: 'Trajets',
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name={'directions-car'} color={color} />
          ),
          headerRight: () => <UserMenu />,
          headerLeft: () => <ThemeToggle />,
        }}
      />
      <Tabs.Screen
        name={'user-list'}
        options={{
          title: 'Messagerie',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name={'messenger'} color={color} />,
          headerRight: () => <UserMenu />,
          headerLeft: () => <ThemeToggle />,
        }}
      />
    </Tabs>
  );
}