import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventDetailScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const tabs = ['Overview', 'Timeline', 'Staff', 'Budget', 'Guests'];

  // --- MOCK DATA ---
  const timelineData = [
    { id: '1', time: '08:00', title: 'Venue Load-in', desc: 'Catering and Decor team arrival', status: 'Done' },
    { id: '2', time: '10:00', title: 'Technical Rehearsal', desc: 'Soundcheck and AV setup', status: 'In Progress' },
    { id: '3', time: '12:00', title: 'Guest Arrival', desc: 'Welcome drinks in the lobby', status: 'Upcoming' },
    { id: '4', time: '14:00', title: 'Main Keynote', desc: 'Stage session starts', status: 'Upcoming' },
  ];

  const budgetData = [
    { item: 'Venue Rental', cost: 12000, status: 'Paid', category: 'Logistics' },
    { item: 'Premium Catering', cost: 15500, status: 'Pending', category: 'Food' },
    { item: 'Floral Design', cost: 4950, status: 'Partial', category: 'Decor' },
  ];

  const guestData = [
    { name: 'John & Jane Doe', count: '2 Guests', status: 'Confirmed', table: 'T-04' },
    { name: 'Michael Scott', count: '1 Guest', status: 'Pending', table: 'T-12' },
    { name: 'The Halpert Family', count: '4 Guests', status: 'Declined', table: 'N/A' },
  ];

  // Logic to filter guests based on search
  const filteredGuests = useMemo(() => {
    return guestData.filter(guest => 
      guest.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const isCurrentlyHappening = (itemTime: string) => {
    const [hours, minutes] = itemTime.split(':').map(Number);
    const itemDate = new Date();
    itemDate.setHours(hours, minutes, 0);
    const now = new Date();
    return now >= itemDate && now < new Date(itemDate.getTime() + 2 * 60 * 60 * 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-800">
          <TouchableOpacity 
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(planner)/events' as any)} 
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800"
          >
            <Ionicons name="arrow-back" size={20} color="#6366f1" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-slate-900 dark:text-white" numberOfLines={1}>Modern Wedding Expo</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="ellipsis-horizontal" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row px-2 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800">
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              className={`flex-1 items-center py-4 ${activeTab === tab ? 'border-b-2 border-indigo-600' : ''}`}
            >
              <Text className={`font-bold text-[10px] uppercase tracking-widest ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <View>
              <View className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px] mb-6 border border-slate-100 dark:border-slate-700">
                <Text className="text-slate-900 dark:text-white text-xl font-black mb-2">Event Summary</Text>
                <Text className="text-slate-500 leading-6 text-sm">High-end wedding showcase with 50+ vendors. Main goal is 1,200 attendee conversion and vendor networking.</Text>
              </View>
              <View className="flex-row justify-between">
                <View className="bg-indigo-600 p-6 rounded-[32px] w-[48%] shadow-lg shadow-indigo-200">
                  <Ionicons name="people" size={20} color="white" />
                  <Text className="text-white font-black text-2xl mt-4">1.2k</Text>
                  <Text className="text-indigo-100 text-[10px] font-bold uppercase tracking-tighter">Expected Guests</Text>
                </View>
                <View className="bg-emerald-500 p-6 rounded-[32px] w-[48%] shadow-lg shadow-emerald-200">
                  <Ionicons name="wallet" size={20} color="white" />
                  <Text className="text-white font-black text-2xl mt-4">$24k</Text>
                  <Text className="text-emerald-100 text-[10px] font-bold uppercase tracking-tighter">Current Spent</Text>
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'Timeline' && (
            <View>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-slate-900 dark:text-white text-xl font-black">Event Flow</Text>
                <View className="flex-row items-center bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
                  <View className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse mr-2" />
                  <Text className="text-indigo-600 dark:text-indigo-300 text-[10px] font-black uppercase">Live</Text>
                </View>
              </View>
              {timelineData.map((item, index) => {
                const active = isCurrentlyHappening(item.time);
                return (
                  <View key={item.id} className="flex-row mb-2">
                    <View className="items-center mr-4 pt-1">
                      <View className={`w-3 h-3 rounded-full z-10 ${active ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      {index !== timelineData.length - 1 && (
                        <View className="w-[1px] flex-1 bg-slate-100 dark:bg-slate-800 my-1" />
                      )}
                    </View>
                    <View className={`flex-1 mb-6 p-5 rounded-[24px] border ${active ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900' : 'bg-white border-slate-50 dark:bg-slate-800 dark:border-slate-700'}`}>
                      <Text className={`text-xs font-bold mb-1 ${active ? 'text-indigo-600' : 'text-slate-400'}`}>{item.time}</Text>
                      <Text className="text-slate-900 dark:text-white font-bold text-base">{item.title}</Text>
                      <Text className="text-slate-500 text-xs mt-1 leading-5">{item.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* TAB 3: STAFF */}
          {activeTab === 'Staff' && (
            <View>
              <Text className="text-slate-900 dark:text-white text-xl font-black mb-4">Assigned Team</Text>
              {[
                { name: 'Marcus Chen', role: 'Lead Coordinator', status: 'On-Site' },
                { name: 'Elena Rodriguez', role: 'Vendor Liaison', status: 'Available' },
              ].map((staff, i) => (
                <View key={i} className="flex-row items-center bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <View className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full items-center justify-center mr-4">
                    <Text className="text-indigo-600 font-bold text-lg">{staff.name[0]}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 dark:text-white font-bold">{staff.name}</Text>
                    <Text className="text-slate-500 text-[10px] font-medium">{staff.role}</Text>
                  </View>
                  <View className="bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-lg">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase">{staff.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 4: BUDGET */}
          {activeTab === 'Budget' && (
            <View>
              <View className="bg-slate-900 p-8 rounded-[32px] mb-6 shadow-xl">
                <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Total Utilization</Text>
                <View className="flex-row items-baseline mb-4">
                  <Text className="text-white text-4xl font-black">$32,450</Text>
                  <Text className="text-slate-500 text-sm ml-2">/ $45k</Text>
                </View>
                <View className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <View className="h-full bg-indigo-500" style={{ width: '72%' }} />
                </View>
              </View>
              {budgetData.map((expense, i) => (
                <View key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl mb-3 flex-row items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm">
                  <View className="flex-1 mr-4">
                    <Text className="text-slate-900 dark:text-white font-bold text-base" numberOfLines={1}>{expense.item}</Text>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">{expense.category}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-slate-900 dark:text-white font-black text-base">${expense.cost.toLocaleString()}</Text>
                    <Text className={`text-[10px] font-black uppercase ${expense.status === 'Paid' ? 'text-green-500' : 'text-amber-500'}`}>{expense.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 5: GUESTS */}
          {activeTab === 'Guests' && (
            <View>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-slate-900 dark:text-white text-xl font-black">Guest List</Text>
                <View className="bg-indigo-600 px-3 py-1.5 rounded-xl">
                  <Text className="text-white text-[10px] font-black">{guestData.length} TOTAL</Text>
                </View>
              </View>

              {/* Search */}
              <View className="bg-slate-50 dark:bg-slate-800 flex-row items-center px-4 py-3 rounded-2xl mb-6 border border-slate-100 dark:border-slate-700">
                <Ionicons name="search" size={18} color="#94a3b8" />
                <TextInput 
                  placeholder="Find a guest..."
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-3 dark:text-white font-medium text-sm"
                  value={searchQuery}
                  onChangeText={(text: string) => setSearchQuery(text)}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#cbd5e1" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Rows */}
              {filteredGuests.length > 0 ? (
                filteredGuests.map((guest, i) => (
                  <View key={i} className="bg-white dark:bg-slate-800 p-5 rounded-[24px] mb-3 flex-row items-center justify-between border border-slate-50 dark:border-slate-700 shadow-sm">
                    <View className="flex-1">
                      <Text className="text-slate-900 dark:text-white font-bold text-base">{guest.name}</Text>
                      <Text className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-tighter">
                        {guest.count} • TABLE {guest.table}
                      </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-lg ${
                      guest.status === 'Confirmed' ? 'bg-green-50 dark:bg-green-900/20' : 
                      guest.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <Text className={`text-[10px] font-black uppercase ${
                        guest.status === 'Confirmed' ? 'text-green-600' : 
                        guest.status === 'Pending' ? 'text-amber-600' : 'text-red-600'
                      }`}>{guest.status}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className="items-center py-10">
                  <Text className="text-slate-400 font-medium">No results for "{searchQuery}"</Text>
                </View>
              )}
              
              <TouchableOpacity className="bg-indigo-600 p-5 rounded-[24px] items-center mt-4 mb-10 shadow-lg shadow-indigo-200">
                <Text className="text-white font-bold text-base">Add New Guest</Text>
              </TouchableOpacity>
            </View>
          )}
          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}