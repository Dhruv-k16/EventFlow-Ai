import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Corrected import
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GlobalTimelineScreen() {
  const router = useRouter(); // Added missing router initialization
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const globalTasks = [
    { 
      id: '1', 
      time: '08:00 AM', 
      event: 'Wedding Expo', 
      task: 'Staff Briefing', 
      status: 'Completed', 
      color: 'bg-indigo-600',
      miniTimeline: ['07:00 - Staff Arrival', '08:00 - Briefing', '09:00 - Floor Walk']
    },
    { 
      id: '2', 
      time: '09:30 AM', 
      event: 'Tech Gala', 
      task: 'AV Load-in', 
      status: 'In Progress', 
      color: 'bg-emerald-500',
      miniTimeline: ['09:00 - Truck Unload', '09:30 - AV Load-in', '11:00 - Sound Check']
    },
    { 
      id: '3', 
      time: '11:00 AM', 
      event: 'Wedding Expo', 
      task: 'Catering Setup', 
      status: 'Upcoming', 
      color: 'bg-indigo-600',
      miniTimeline: ['11:00 - Setup', '12:30 - Food Prep', '01:30 - Lunch Service']
    },
  ];

  const toggleExpand = (eventName: string) => {
    // Standard state toggle - safe for New Architecture
    setExpandedEvent(expandedEvent === eventName ? null : eventName);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4">
        <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Master Schedule</Text>
        <Text className="text-3xl font-black text-slate-900 dark:text-white">Today's Pulse</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {globalTasks.map((item) => {
          const isExpanded = expandedEvent === item.event;
          
          return (
            <View key={item.id} className="flex-row mb-6">
              {/* Left Side: Time column */}
              <View className="items-center mr-4 w-16">
                <Text className="text-slate-900 dark:text-white font-black text-xs">{item.time}</Text>
                <View className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 my-2" />
              </View>

              {/* Right Side: Interactive Card */}
              <View className={`flex-1 bg-white dark:bg-slate-800 rounded-[28px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden ${item.status === 'Completed' ? 'opacity-70' : ''}`}>
                
                {/* Badge Header: Clickable to expand */}
                <TouchableOpacity 
                  onPress={() => toggleExpand(item.event)}
                  activeOpacity={0.8}
                  className={`${item.color} p-3 flex-row justify-between items-center`}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="flash" size={12} color="white" />
                    <Text className="text-white text-[10px] font-black uppercase ml-1 tracking-tight">
                      {item.event} • Ongoing
                    </Text>
                  </View>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={14} 
                    color="white" 
                  />
                </TouchableOpacity>

                {/* Main Task Content */}
                <View className="p-5">
                  <Text className="text-slate-900 dark:text-white font-bold text-lg mb-1">{item.task}</Text>
                  <Text className={`text-[10px] font-bold ${item.status === 'In Progress' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {item.status.toUpperCase()}
                  </Text>

                  {/* Expanded Section */}
                  {isExpanded && (
                    <View className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                      <Text className="text-[10px] font-black text-slate-400 uppercase mb-3">Event Run-sheet</Text>
                      
                      {item.miniTimeline.map((step, idx) => (
                        <View key={idx} className="flex-row items-center mb-2">
                          <View className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-3" />
                          <Text className="text-slate-600 dark:text-slate-300 text-xs font-medium">{step}</Text>
                        </View>
                      ))}

                      {/* Redirect to Details Screen */}
                      <TouchableOpacity 
                        onPress={() => router.push('/(planner)/event-detail')}
                        className="mt-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl items-center"
                      >
                        <Text className="text-indigo-600 dark:text-indigo-300 text-xs font-bold">View Detailed Run-sheet</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}