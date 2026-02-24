import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataService } from '../../services/dataStore';

export default function CreateEventScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const vendorTypes = ['Catering', 'Photography', 'Decor', 'Music/DJ', 'Security'];

  const toggleVendor = (type: string) => {
    if (selectedVendors.includes(type)) {
      setSelectedVendors(selectedVendors.filter(v => v !== type));
    } else {
      setSelectedVendors([...selectedVendors, type]);
    }
  };

  const handleCreate = () => {
    if (!name || !date || !location) {
      Alert.alert("Missing Info", "Please fill in the event basics.");
      return;
    }

    DataService.addEvent({ name, date, location, requiredVendors: selectedVendors });
    
    Alert.alert("Success", "Event Created! Job requests sent to vendors.", [
      { text: "View Dashboard", onPress: () => router.replace('/(planner)/dashboard' as any) }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={['top']}>
      
      {/* HEADER: Standardized Overlap-Proof Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-start justify-center">
          <Ionicons name="arrow-back" size={24} color="#6366f1" />
        </TouchableOpacity>
        
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold dark:text-white">Create Event</Text>
        </View>

        {/* Empty w-10 for balance */}
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-black dark:text-white mb-2">New Event</Text>
        <Text className="text-slate-500 mb-8 font-medium">Set up the foundation for your next big occasion.</Text>

        {/* Basic Info */}
        <View className="mb-8">
          {/* Event Name */}
          <View className="mb-5">
            <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2 ml-1">Event Name</Text>
            <View className="bg-slate-50 dark:bg-slate-800 flex-row items-center px-4 rounded-[20px] border border-slate-200 dark:border-slate-700">
              <Ionicons name="ribbon-outline" size={20} color="#94a3b8" />
              <TextInput 
                className="flex-1 p-4 dark:text-white font-medium"
                placeholder="e.g. Annual Tech Gala 2026"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Date and Location in a cleaner stack */}
          <View className="mb-5">
            <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2 ml-1">Date</Text>
            <View className="bg-slate-50 dark:bg-slate-800 flex-row items-center px-4 rounded-[20px] border border-slate-200 dark:border-slate-700">
              <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
              <TextInput 
                className="flex-1 p-4 dark:text-white font-medium"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                value={date}
                onChangeText={setDate}
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2 ml-1">Venue / Location</Text>
            <View className="bg-slate-50 dark:bg-slate-800 flex-row items-center px-4 rounded-[20px] border border-slate-200 dark:border-slate-700">
              <Ionicons name="map-outline" size={20} color="#94a3b8" />
              <TextInput 
                className="flex-1 p-4 dark:text-white font-medium"
                placeholder="Enter address"
                placeholderTextColor="#94a3b8"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
        </View>

        {/* Vendor Selection */}
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-4 ml-1">Select Required Vendors</Text>
        <View className="flex-row flex-wrap mb-10">
          {vendorTypes.map((type) => {
            const isSelected = selectedVendors.includes(type);
            return (
              <TouchableOpacity 
                key={type}
                onPress={() => toggleVendor(type)}
                activeOpacity={0.7}
                className={`mr-2 mb-2 px-5 py-3 rounded-full border ${
                  isSelected 
                  ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Text className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {isSelected ? `✓ ${type}` : type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          onPress={handleCreate}
          activeOpacity={0.8}
          className="bg-indigo-600 p-5 rounded-[24px] items-center shadow-xl shadow-indigo-300 mb-12"
        >
          <Text className="text-white font-bold text-lg">Create Event Flow</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}