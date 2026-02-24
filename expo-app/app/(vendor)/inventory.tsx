import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VendorInventoryScreen() {
  const [view, setView] = useState<'Stock' | 'Staff'>('Stock');

  const stockItems = [
    { id: '1', name: 'Velvet Dining Chairs', total: 200, available: 45, status: 'Low Stock', color: 'text-red-500' },
    { id: '2', name: 'Premium Sound System', total: 10, available: 8, status: 'Good', color: 'text-emerald-500' },
    { id: '3', name: 'Silk Table Linens', total: 500, available: 320, status: 'Good', color: 'text-emerald-500' },
  ];

  const vendorStaff = [
    { name: 'Alex Rivera', role: 'Lead Setup', status: 'At Event: Wedding Expo', active: true },
    { name: 'Sam Knight', role: 'Driver', status: 'Warehouse', active: false },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
      <View className="px-6 py-4 flex-row justify-between items-center">
        <View>
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[2px]">Vendor Portal</Text>
          <Text className="text-2xl font-black text-slate-900 dark:text-white">Elite Decor Co.</Text>
        </View>
        <TouchableOpacity className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl items-center justify-center shadow-sm">
          <Ionicons name="notifications-outline" size={22} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Toggle Stock / Staff */}
      <View className="flex-row px-6 mb-6">
        <View className="flex-row flex-1 bg-slate-200/50 dark:bg-slate-800 p-1.5 rounded-[20px]">
          {['Stock', 'Staff'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setView(tab as any)}
              className={`flex-1 py-3 rounded-[16px] items-center ${view === tab ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <Text className={`font-bold text-xs ${view === tab ? 'text-indigo-600 dark:text-white' : 'text-slate-500'}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {view === 'Stock' ? (
          <View>
            <Text className="text-slate-900 dark:text-white text-lg font-black mb-4">Inventory Overview</Text>
            {stockItems.map((item) => (
              <View key={item.id} className="bg-white dark:bg-slate-800 p-5 rounded-[28px] mb-4 flex-row items-center border border-slate-100 dark:border-slate-700 shadow-sm">
                <View className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="cube-outline" size={24} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 dark:text-white font-bold">{item.name}</Text>
                  <Text className="text-slate-400 text-[10px] font-black uppercase">Total: {item.total}</Text>
                </View>
                <View className="items-end">
                  <Text className={`text-lg font-black ${item.available < 50 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{item.available}</Text>
                  <Text className="text-slate-400 text-[8px] font-bold uppercase">Available</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View>
            <Text className="text-slate-900 dark:text-white text-lg font-black mb-4">Field Crew</Text>
            {vendorStaff.map((staff, i) => (
              <View key={i} className="bg-white dark:bg-slate-800 p-5 rounded-[28px] mb-4 flex-row items-center border border-slate-100 dark:border-slate-700">
                <View className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full mr-4 items-center justify-center">
                  <Text className="font-bold text-slate-500">{staff.name[0]}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 dark:text-white font-bold">{staff.name}</Text>
                  <Text className="text-slate-400 text-[10px] font-bold uppercase">{staff.role}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${staff.active ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                  <Text className={`text-[8px] font-black uppercase ${staff.active ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {staff.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Quick Action Button */}
      <TouchableOpacity className="absolute bottom-10 right-6 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center shadow-xl">
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}