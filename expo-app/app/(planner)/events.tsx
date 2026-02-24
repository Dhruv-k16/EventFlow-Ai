import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for the event list
  const events = [
    { id: '1', name: 'Modern Wedding Expo', date: 'June 12, 2026', location: 'Grand Plaza, NY', progress: 0.85, type: 'Wedding' },
    { id: '2', name: 'Tech Gala 2026', date: 'July 05, 2026', location: 'Innovation Hub, SF', progress: 0.40, type: 'Corporate' },
    { id: '3', name: 'Sarah’s 30th Birthday', date: 'Sept 22, 2026', location: 'The Rooftop Loft', progress: 0.10, type: 'Private' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center">
        <Text className="text-3xl font-black text-slate-900 dark:text-white">Events</Text>
        <TouchableOpacity className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <Ionicons name="filter" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-6">
        <View className="bg-white dark:bg-slate-800 flex-row items-center px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput 
            placeholder="Search events..."
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-3 dark:text-white font-medium"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {events.map((event) => (
          <TouchableOpacity 
            key={event.id}
            onPress={() => router.push('/(planner)/event-detail')}
            activeOpacity={0.9}
            className="bg-white dark:bg-slate-800 rounded-[28px] p-5 mb-5 border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 mr-2">
                <View className="bg-indigo-50 dark:bg-indigo-900/30 self-start px-3 py-1 rounded-full mb-2">
                  <Text className="text-indigo-600 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest">{event.type}</Text>
                </View>
                <Text className="text-xl font-bold text-slate-900 dark:text-white" numberOfLines={1}>{event.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </View>

            <View className="flex-row items-center mb-4">
              <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
              <Text className="text-slate-500 ml-2 text-sm">{event.date}</Text>
              <View className="mx-2 w-1 h-1 rounded-full bg-slate-300" />
              <Ionicons name="location-outline" size={16} color="#94a3b8" />
              <Text className="text-slate-500 ml-1 text-sm" numberOfLines={1}>{event.location}</Text>
            </View>

            {/* Progress Bar */}
            <View className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <View 
                className="h-full bg-indigo-600 rounded-full" 
                style={{ width: `${event.progress * 100}%` }} 
              />
            </View>
            <Text className="text-right text-[10px] font-bold text-slate-400 mt-2 uppercase">
              {Math.round(event.progress * 100)}% Readiness
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}