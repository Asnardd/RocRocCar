import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { getDocs, Timestamp } from 'firebase/firestore';
import { collection, doc } from '@firebase/firestore';
import { db } from '@/lib/firebase';
import React, { useState } from 'react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Message } from 'components/message-card';
import { useUser } from '@clerk/clerk-expo';

export type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export function UserCard({ user, onPress }: { user: User; onPress?: () => void}) {
  const {user: currentUser} = useUser();
  const [latestMessage, setLatestMessage] = React.useState<Message | null>(null);

  React.useEffect(() => {
    async function getLatestMessage() {
      if (!currentUser) return;
      const conversationId = [currentUser.id, user.id].sort().join('_');
      const docs = await getDocs(
        collection(db, 'conversations', conversationId, 'messages')
      );
      if (docs.empty) return;
      const messages = docs.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        senderId: doc.data().senderId,
        createdAt: doc.data().createdAt?.toDate() ?? new Date(),
      }));
      const sorted = messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setLatestMessage(sorted[0]);
    }
    getLatestMessage()
  }, [user.id])

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
      {latestMessage && (
        <Text className="text-sm text-gray-400">
          {latestMessage.senderId === user.id ? user.name : currentUser?.fullName } : {''}
          <Text className="text-sm text-gray-600">
            {latestMessage.text.length > 20
              ? `${latestMessage.text.slice(0, 20)}...`
              : latestMessage.text}
          </Text>
        </Text>
      )}
    </Pressable>
  );
}
