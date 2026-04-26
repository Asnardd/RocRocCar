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


export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { user } = useUser();
  const [users, setUsers] = React.useState<User[]>([]);
  const [search, setSearch] = React.useState('');

  const filteredUsers = React.useMemo(() => {
    if (!search) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  React.useEffect(() => {
    async function fetchUsers(){
      const docs = await getDocs(collection(db, 'users'));
      const fetched = docs.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        name: doc.data().name,
        avatar: doc.data().avatar,
      }));
      setUsers(fetched);
    }
    fetchUsers();
  })

  return (
    <>
      <ScrollView className="gap-4 p-4">
        <Label>Rechercher un utilisateur</Label>
        <Input
          placeholder="Entrez le nom d'un utilisateur"
          value={search}
          onChangeText={setSearch}
        />
        <View className="mt-5 gap-2">
          {filteredUsers.length > 0 &&
            filteredUsers.map((user) => <UserCard user={user} key={user.id} onPress={() => {
              router.navigate({
                pathname: '/messages',
                params: { recipientUserId: user.id }
              })
            }} />)
          }
        </View>
      </ScrollView>
    </>
  );
}
