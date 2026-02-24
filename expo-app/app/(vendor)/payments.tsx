import { Text, View } from 'react-native';

export default function VendorPaymentsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold">Earnings & Payouts</Text>
      <Text className="text-slate-500">Your financial history will appear here.</Text>
    </View>
  );
}