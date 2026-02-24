import { Text, View } from 'react-native';

export default function MyEventScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold">My Event Timeline</Text>
      <Text className="text-slate-500">Track your booking progress here.</Text>
    </View>
  );
}