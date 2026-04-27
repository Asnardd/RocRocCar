import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { ToastConfig } from 'react-native-toast-message';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View className="mx-4 flex-row items-start gap-3 rounded-md border border-border bg-background p-4 shadow-md shadow-black/5">
      <MaterialIcons name="check-circle" size={20} color="#22c55e" />
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-medium text-foreground">{text1}</Text>
        {text2 && <Text className="text-sm text-muted-foreground">{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View className="mx-4 flex-row items-start gap-3 rounded-md border border-destructive/50 bg-background p-4 shadow-md shadow-black/5">
      <MaterialIcons name="error" size={20} color="#ef4444" />
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-medium text-foreground">{text1}</Text>
        {text2 && <Text className="text-sm text-muted-foreground">{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View className="mx-4 flex-row items-start gap-3 rounded-md border border-border bg-background p-4 shadow-md shadow-black/5">
      <MaterialIcons name="info" size={20} color="#6366f1" />
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-medium text-foreground">{text1}</Text>
        {text2 && <Text className="text-sm text-muted-foreground">{text2}</Text>}
      </View>
    </View>
  ),
};
