import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { DataService } from '../../services/dataStore';

export default function WeatherWidget() {
  const weather = DataService.getWeather();
  
  return (
    <View className="bg-white dark:bg-slate-800 p-5 rounded-[24px] flex-row items-center shadow-sm border border-slate-100 dark:border-slate-700 mx-6 mb-6">
      <View className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-2xl">
        <Ionicons name={weather.icon} size={32} color="#d97706" />
      </View>
      
      <View className="ml-4 flex-1">
        <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
          Event Day Forecast
        </Text>
        <View className="flex-row items-baseline">
          <Text className="text-2xl font-bold dark:text-white">{weather.temp}</Text>
          <Text className="text-slate-500 dark:text-slate-400 ml-2 font-medium">
            • {weather.condition}
          </Text>
        </View>
      </View>
      
      <View className="items-end">
        <Ionicons name="location" size={14} color="#6366f1" />
        <Text className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">NYC</Text>
      </View>
    </View>
  );
}