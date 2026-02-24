import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'nativewind'; // Import this to fix Dark Mode
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SharedSettingsProps {
  role: 'Planner' | 'Vendor' | 'Client';
  initialName: string;
}

export default function SharedSettings({ role, initialName }: SharedSettingsProps) {
  const router = useRouter();
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme(); // NativeWind hook
  
  const [name, setName] = useState(initialName);
  const [tempName, setTempName] = useState(initialName);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Load saved name on mount
  useEffect(() => {
    const loadName = async () => {
      const savedName = await SecureStore.getItemAsync(`userName_${role}`);
      if (savedName) setName(savedName);
    };
    loadName();
  }, []);

  const handleSaveName = async () => {
    if (tempName.trim().length < 2) {
      Alert.alert("Error", "Name is too short");
      return;
    }
    await SecureStore.setItemAsync(`userName_${role}`, tempName);
    setName(tempName);
    setIsEditModalVisible(false);
  };

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync('userRole');
          router.replace('/(auth)/login' as any);
        }
      }
    ]);
  };

  // Fixed SettingItem with Flex Balancing to prevent overlap
  const SettingItem = ({ icon, title, value, type = 'chevron', onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between bg-white dark:bg-slate-800 p-4 border-b border-slate-50 dark:border-slate-700"
    >
      <View className="flex-row items-center flex-1 mr-4">
        <View className="bg-slate-100 dark:bg-slate-700 p-2 rounded-xl mr-3">
          <Ionicons name={icon} size={20} color="#6366f1" />
        </View>
        <Text className="text-slate-900 dark:text-white font-semibold text-base" numberOfLines={1}>
          {title}
        </Text>
      </View>
      
      {type === 'switch' ? (
        <Switch 
          value={value} 
          onValueChange={onPress} 
          trackColor={{ false: '#cbd5e1', true: '#818cf8' }} 
          thumbColor={value ? '#4f46e5' : '#f4f3f4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center py-10 bg-white dark:bg-slate-800 mb-6 shadow-sm rounded-b-[40px] border-b border-slate-100 dark:border-slate-700">
          <View className="w-28 h-28 bg-indigo-100 dark:bg-indigo-900/40 rounded-full items-center justify-center mb-4 border-4 border-white dark:border-slate-700 shadow-xl">
            <Text className="text-indigo-600 dark:text-indigo-300 text-4xl font-black">
              {name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <Text className="text-2xl font-black text-slate-900 dark:text-white">{name}</Text>
          <View className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full mt-1">
            <Text className="text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest">{role} Account</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => {
              setTempName(name);
              setIsEditModalVisible(true);
            }}
            className="mt-6 px-8 py-3 bg-indigo-600 rounded-2xl shadow-md shadow-indigo-200"
          >
            <Text className="text-white font-bold">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        <Text className="px-8 mb-3 text-xs font-black text-slate-400 uppercase tracking-[2px]">Preferences</Text>
        <View className="mb-8 mx-6 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
          {/* DARK MODE SWITCH - Now uses setColorScheme */}
          <SettingItem 
            icon="moon-outline" 
            title="Dark Mode" 
            type="switch" 
            value={colorScheme === 'dark'} 
            onPress={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')} 
          />
          <SettingItem 
            icon="notifications-outline" 
            title="Notifications" 
            type="switch" 
            value={notifications} 
            onPress={() => setNotifications(!notifications)} 
          />
        </View>

        <Text className="px-8 mb-3 text-xs font-black text-slate-400 uppercase tracking-[2px]">Account</Text>
        <View className="mb-10 mx-6 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
            <SettingItem icon="shield-checkmark-outline" title="Privacy Policy" />
            <SettingItem icon="help-circle-outline" title="Support Center" />
        </View>

        <TouchableOpacity 
          onPress={handleLogout} 
          className="mx-6 mb-20 bg-white dark:bg-slate-800 p-5 rounded-3xl items-center border border-red-100 dark:border-red-900/30 shadow-sm"
        >
          <Text className="text-red-500 font-bold text-lg">Sign Out</Text>
        </TouchableOpacity>

        {/* Edit Profile Modal */}
        <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white dark:bg-slate-800 rounded-t-[40px] p-8 shadow-2xl">
              <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full self-center mb-6" />
              <Text className="text-2xl font-black mb-2 dark:text-white">Edit Profile</Text>
              <Text className="text-slate-500 mb-6">Update your display name across the platform.</Text>
              
              <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2 ml-1">Full Name</Text>
              <TextInput 
                className="bg-slate-100 dark:bg-slate-700 p-5 rounded-2xl mb-8 text-lg dark:text-white font-semibold"
                value={tempName}
                onChangeText={setTempName}
                autoFocus
              />
              
              <View className="flex-row justify-between space-x-4 mb-4">
                <TouchableOpacity 
                    onPress={() => setIsEditModalVisible(false)} 
                    className="flex-1 bg-slate-100 dark:bg-slate-700 p-5 rounded-2xl items-center"
                >
                  <Text className="text-slate-600 dark:text-slate-300 font-bold text-lg">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={handleSaveName} 
                    className="flex-1 bg-indigo-600 p-5 rounded-2xl items-center shadow-lg shadow-indigo-200"
                >
                  <Text className="text-white font-bold text-lg">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}