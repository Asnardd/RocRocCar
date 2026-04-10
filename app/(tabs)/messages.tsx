import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { UserMenu } from '@/components/user-menu';
import { useUser } from '@clerk/clerk-expo';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, XIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { user } = useUser();

  return (
    <>
      <View className="flex-1 items-center justify-center gap-8 p-4">
        <View className="gap-2">
          <Input
            placeholder="Type something and press enter..."
            onSubmitEditing={async (event) => {
              const text = event.nativeEvent.text;
              try {
                await addDoc(collection(db, 'messages'), {
                  text,
                  createdAt: new Date(),
                  userId: user?.id,
                });
                console.log('Message added to Firestore');
              } catch (error) {
                console.error('Error adding message: ', error);
              }
            }}
          />
        </View>
      </View>
    </>
  );
}
