import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
// Use the modern Safe Area provider
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const router = useRouter();

  const notifications = [
    { id: '1', title: 'Payment Received', body: 'Sarah & Marc paid the venue deposit.', time: '2h ago' },
    { id: '2', title: 'Timeline Update', body: 'Elite Catering updated their arrival time.', time: '5h ago' },
    { id: '3', title: 'New Vendor Inquiry', body: 'A photographer is interested in your marketplace.', time: '1d ago' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      {/* HEADER: Explicitly spaced using flex-row and justify-between */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800">
        
        {/* Left Section: Back Button */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 items-start justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="#6366f1" />
        </TouchableOpacity>

        {/* Center Section: Title */}
        <View className="flex-1 items-center">
          <Text className="text-white text-xl font-bold">Activity Feed</Text>
        </View>

        {/* Right Section: Clear All */}
        <TouchableOpacity className="w-16 items-end justify-center">
          <Text className="text-indigo-400 font-bold text-sm">Clear All</Text>
        </TouchableOpacity>
        
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {notifications.map((item) => (
          <View key={item.id} className="bg-slate-800/50 p-5 rounded-[24px] mb-4 border border-slate-700/50">
            <View className="flex-row justify-between items-start mb-1">
              <Text className="font-bold text-white text-base flex-1 mr-2">{item.title}</Text>
              <Text className="text-slate-500 text-[10px] uppercase font-bold">{item.time}</Text>
            </View>
            <Text className="text-slate-400 text-sm leading-5">{item.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}