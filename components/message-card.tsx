import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@clerk/clerk-expo';
import { User } from '@/components/user-card';

export type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: Date;
};

export function MessageCard({ message, sender }: { message: Message; sender?: User }) {
  const { user } = useUser();
  const isMe = message.senderId === user?.id;
  console.log('senderId:', message.senderId, 'userId:', user?.id);


  return (
    <View
      style={{
        flexDirection: isMe ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 12,
      }}>
      {!isMe && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#888',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 12, fontWeight: '600' }}>
            {sender?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
      )}

      <View style={{ maxWidth: '70%', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
        <View
          style={{
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: isMe ? '#6366f1' : '#333',
            alignSelf: isMe ? 'flex-end' : 'flex-start',
          }}>
          <Text style={{ color: '#fff' }}>{message.text}</Text>
        </View>
        <Text style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
          {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}
