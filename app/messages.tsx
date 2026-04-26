import { ScrollView, View } from 'react-native';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as React from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { addDoc, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Stack, useLocalSearchParams } from 'expo-router';
import { User } from 'components/user-card'
import { setDoc } from '@firebase/firestore';
import { useUser } from '@clerk/clerk-expo';
import { Message, MessageCard } from 'components/message-card'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Screen() {
  const { recipientUserId } = useLocalSearchParams<{ recipientUserId: string }>();
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [recipent, setRecipent] = React.useState<User | null>(null);
  const { user } = useUser();
  const scrollViewRef = React.useRef<ScrollView>(null);

  async function getMessages() {
    if (!user) return;
    const conversationId = [user.id, recipientUserId].sort().join('_');
    const docs = await getDocs(collection(db, 'conversations', conversationId, 'messages'));
    const messages = docs.docs.map((doc) => ({
      id: doc.id,
      text: doc.data().text,
      senderId: doc.data().senderId,
      createdAt: doc.data().createdAt?.toDate() ?? new Date(),
    }));
    setMessages(
      messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    );
  }


  async function sendMessage() {
    console.log('Sending...');
    if (message.length < 1 || !user) return;
    console.log('Message length above 1 and user exist!');
    const conversationId = [user.id, recipientUserId].sort().join('_');
    console.log('Conversation ID: ', conversationId);
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      text: message,
      senderId: user.id,
      createdAt: new Date(),
    });
    setMessage('');
    getMessages();
  }

  React.useEffect(() => {
    async function getRecipent() {
      const recipentDoc = await getDoc(doc(db, 'users', recipientUserId));
      if (!recipentDoc.exists()) {
        console.error('Utilisateur non trouvé');
        return null;
      }
      const recipent =  {
        id: recipentDoc.id,
        email: recipentDoc.data().email,
        name: recipentDoc.data().name,
        avatar: recipentDoc.data().avatar,
      };
      setRecipent(recipent);
    }
    getRecipent()
    getMessages();
  }, [recipientUserId])

  React.useEffect(() => {
    console.log('recipent:', JSON.stringify(recipent));
  }, [recipent]);

  return (
    <>
      <Stack.Screen options={{ title: 'Messages à ' + (recipent ? recipent?.name : 'Inconnu') }} />
      <ScrollView
        className="gap-4 p-4"
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {/* TODO : Not working yet */}
        {messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            sender={
              message.senderId === user?.id
                ? { id: user.id, name: user.fullName ?? 'Moi', email: '', avatar: user.imageUrl }
                : (recipent ?? undefined)
            }
          />
        ))}
      </ScrollView>
      <View className="mb-5 flex-row items-center gap-2 bg-background p-4">
        <Input
          placeholder="Écrire un message..."
          className="flex-1"
          value={message}
          onChangeText={setMessage}
        />
        <Button onPress={sendMessage}>
          <MaterialIcons size={24} name={'send'} />
        </Button>
      </View>
    </>
  );
}