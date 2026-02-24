import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { DataService, Event } from '../../services/dataStore';
import WeatherWidget from '../components/WeatherWidget';

export default function ClientDashboard() {
  const router=useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadClientData = () => {
    setEvents(DataService.getClientEvents());
  };

  useEffect(() => {
    loadClientData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadClientData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const activeEvent = events[0];
  const progress = activeEvent ? DataService.getEventProgress(activeEvent.id) : 0;

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 1. Hero Section: Welcome & Countdown */}
      <View className="p-8 bg-indigo-600 rounded-b-[40px] mb-6 shadow-xl shadow-indigo-200">
        <Text className="text-indigo-100 text-lg font-medium">Hello there!</Text>
        <Text className="text-white text-3xl font-bold mt-1">
          {activeEvent?.name || "No Active Event"}
        </Text>
        
        <View className="flex-row items-center mt-6 bg-white/20 p-4 rounded-2xl">
          <Ionicons name="calendar-outline" size={24} color="white" />
          <View className="ml-3">
            <Text className="text-white font-bold text-lg">Dec 01, 2024</Text>
            <Text className="text-indigo-100 text-xs uppercase tracking-widest">Event Date</Text>
          </View>
        </View>
      </View>

      {/* 2. Weather Forecast Widget */}
      <WeatherWidget />

      <View className="px-6 pb-10">
        {/* 3. Overall Progress Card */}
        <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm mb-8 border border-slate-100 dark:border-slate-700">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xl font-bold dark:text-white">Planning Progress</Text>
              <Text className="text-slate-400 text-sm mt-1">Based on timeline tasks</Text>
            </View>
            <View className="bg-indigo-50 dark:bg-indigo-900/40 p-3 rounded-2xl">
              <Text className="text-indigo-600 dark:text-indigo-300 font-black text-lg">{progress}%</Text>
            </View>
          </View>
          
          <View className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <View 
              className="h-full bg-indigo-500 rounded-full" 
              style={{ width: `${progress}%` }} 
            />
          </View>
        </View>

        {/* 4. Confirmed Vendors Section */}
        <Text className="text-xl font-bold dark:text-white mb-4 px-1">Confirmed Vendors</Text>
        
        {activeEvent?.requiredVendors.map((vendor, index) => (
          <View 
            key={`${vendor}-${index}`} 
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl mb-4 flex-row items-center shadow-sm border border-slate-100 dark:border-slate-700"
          >
            <View className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full items-center justify-center mr-4">
              <Ionicons 
                name={vendor === 'Catering' ? 'restaurant' : 'camera'} 
                size={22} 
                color="#4f46e5" 
              />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg dark:text-white">{vendor}</Text>
              <View className="flex-row items-center mt-1">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-slate-500 text-xs">Contract Confirmed</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl">
              <Ionicons name="chevron-forward" size={18} color="#6366f1" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity 
          onPress={() => router.push('/chat')} // Navigate to Chat
          activeOpacity={0.7}
          className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 ..."
        >
          <View>
            <Text className="text-indigo-600 font-bold text-lg">Need help?</Text>
            <Text className="text-indigo-400 text-sm">Message your lead planner</Text>
          </View>
          <View className="bg-indigo-600 p-3 rounded-2xl">
            <Ionicons name="chatbubbles" size={24} color="white" />
          </View>
        </TouchableOpacity>

        {/* 5. Quick Help / Planner Contact */}
        <TouchableOpacity 
          activeOpacity={0.7}
          className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-6 rounded-3xl flex-row items-center justify-between"
        >
          <View>
            <Text className="text-indigo-600 dark:text-indigo-300 font-bold text-lg">Need help?</Text>
            <Text className="text-indigo-400 dark:text-indigo-400/60 text-sm">Message your lead planner</Text>
          </View>
          <View className="bg-indigo-600 p-3 rounded-2xl">
            <Ionicons name="chatbubbles" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}