import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DataService } from '../../services/dataStore';

const categories = ['All', 'Catering', 'Decor', 'Music', 'Photo'];

export default function HomeMarketplace() {
  const [activeCategory, setActiveCategory] = useState('All');
  // State to track favorited vendors (using an ID-based approach)
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleLike = (vendorId: string) => {
    if (favorites.includes(vendorId)) {
      setFavorites(favorites.filter(id => id !== vendorId));
    } else {
      setFavorites([...favorites, vendorId]);
    }
    // Call the DataService method we added earlier
    DataService.toggleFavorite(vendorId);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Search Header */}
      <View className="p-6 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <Text className="text-2xl font-bold dark:text-white mb-4">Discover Services</Text>
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-2xl">
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput 
            placeholder="Search vendors, venues..." 
            className="ml-2 flex-1 dark:text-white"
            placeholderTextColor="#94a3b8"
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setActiveCategory(cat)}
              className={`mr-2 px-5 py-2 rounded-full ${activeCategory === cat ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-700'}`}
            >
              <Text className={`font-medium ${activeCategory === cat ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Marketplace Content */}
      <View className="p-6">
        <Text className="text-xl font-bold dark:text-white mb-4">Featured for You</Text>
        
        {/* Vendor Card - Elite Catering */}
        <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
          {/* Vendor Image Placeholder */}
          <View className="h-48 bg-slate-200 dark:bg-slate-700 items-center justify-center relative">
            <Ionicons name="image-outline" size={40} color="#94a3b8" />
            
            {/* FAVORITE TOGGLE (Heart Button) */}
            <TouchableOpacity 
              onPress={() => toggleLike('vendor_1')}
              className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-sm"
            >
              <Ionicons 
                name={favorites.includes('vendor_1') ? "heart" : "heart-outline"} 
                size={22} 
                color={favorites.includes('vendor_1') ? "#ef4444" : "#64748b"} 
              />
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-bold dark:text-white">Elite Catering Co.</Text>
                <Text className="text-slate-500 text-sm mt-0.5">Gourmet Fusion • NYC</Text>
              </View>
              <View className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                <Text className="text-indigo-600 dark:text-indigo-300 font-bold text-xs">4.9 ★</Text>
              </View>
            </View>

            <View className="flex-row mt-6 items-center justify-between">
              <View>
                <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">$1,200+</Text>
                <Text className="text-slate-400 text-[10px] uppercase font-bold">Estimated Quote</Text>
              </View>
              <TouchableOpacity className="bg-indigo-600 px-6 py-3 rounded-2xl shadow-md shadow-indigo-200">
                <Text className="text-white font-bold">View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Vendor Card - Sound Wave DJs */}
        <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
          <View className="h-48 bg-slate-200 dark:bg-slate-700 items-center justify-center relative">
            <Ionicons name="musical-notes-outline" size={40} color="#94a3b8" />
            <TouchableOpacity 
              onPress={() => toggleLike('vendor_2')}
              className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-sm"
            >
              <Ionicons 
                name={favorites.includes('vendor_2') ? "heart" : "heart-outline"} 
                size={22} 
                color={favorites.includes('vendor_2') ? "#ef4444" : "#64748b"} 
              />
            </TouchableOpacity>
          </View>
          <View className="p-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-bold dark:text-white">Sound Wave DJs</Text>
                <Text className="text-slate-500 text-sm mt-0.5">Audio & Lighting • Brooklyn</Text>
              </View>
              <View className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                <Text className="text-indigo-600 dark:text-indigo-300 font-bold text-xs">4.8 ★</Text>
              </View>
            </View>
            <View className="flex-row mt-6 items-center justify-between">
              <View>
                <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">$850+</Text>
                <Text className="text-slate-400 text-[10px] uppercase font-bold">Base Package</Text>
              </View>
              <TouchableOpacity className="bg-indigo-600 px-6 py-3 rounded-2xl shadow-md shadow-indigo-200">
                <Text className="text-white font-bold">View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}