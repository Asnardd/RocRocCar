import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { getDoc, Timestamp } from 'firebase/firestore';
import { doc } from '@firebase/firestore';
import { db } from '@/lib/firebase';
import React, { useState } from 'react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

export type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export function UserCard({ user, onPress }: { user: User; onPress?: () => void }) {

  return (
    <Pressable onPress={onPress} className="gap-1 rounded-xl border border-border p-3">
      <Avatar alt={user.name}>
        {user.avatar ? (
          <AvatarImage source={{ uri: user.avatar }} />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Text className="text-sm font-semibold text-muted-foreground">
              {user.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
      </Avatar>
      <Text className="font-semibold">{user.name}</Text>
    </Pressable>
  );
}
