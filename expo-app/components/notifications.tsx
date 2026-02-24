import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();

  const notifications = [
    { id: '1', title: 'Payment Received', body: 'Sarah & Marc paid the venue deposit.', time: '2h ago' },
    { id: '2', title: 'New Message', body: 'Elite Catering updated their arrival time.', time: '5h ago' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      {/* HEADER: Fixed Overlap */}
      <View className="flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
            <Ionicons name="arrow-back" size={24} color="#6366f1" />
          </TouchableOpacity>
          <Text className="text-xl font-bold dark:text-white" numberOfLines={1}>
            Activity Feed
          </Text>
        </View>
        
        <TouchableOpacity className="ml-2">
          <Text className="text-indigo-600 font-bold text-sm">Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        {notifications.map((item) => (
          <View key={item.id} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl mb-4 border border-slate-100 dark:border-slate-700 shadow-sm">
            <Text className="font-bold text-slate-900 dark:text-white text-base">{item.title}</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-5">{item.body}</Text>
            <Text className="text-slate-400 text-[10px] mt-3 font-medium uppercase tracking-tighter">{item.time}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}