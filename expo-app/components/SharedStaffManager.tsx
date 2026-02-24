import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Added
import { DataService, StaffMember } from '../../services/dataStore';
import TaskAssignmentModal from './TaskAssignmentModal';

export default function SharedStaffManager({ context }: { context: 'Planner' | 'Vendor' }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>(DataService.getStaff(context));

  return (
    // Edges top ensures it handles the notch area
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
      <ScrollView className="flex-1 p-4">
        
        {/* HEADER SECTION: Fixed Overlap with Flex Balancing */}
        <View className="flex-row items-center justify-between mb-8 px-1">
          {/* Left: Growable Container */}
          <View className="flex-1 mr-4">
            <Text className="text-3xl font-extrabold text-slate-900 dark:text-white" numberOfLines={1}>
              {context} Team
            </Text>
            <Text className="text-slate-500 text-sm font-medium mt-1">
              Manage your {context.toLowerCase()} staff members
            </Text>
          </View>
          
          {/* Right: Fixed Action Button */}
          <TouchableOpacity className="bg-indigo-600 w-14 h-14 rounded-2xl items-center justify-center shadow-lg shadow-indigo-300">
            <Ionicons name="person-add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* STAFF CARDS: Balanced Rows */}
        {staff.map((member) => (
          <View 
            key={member.id} 
            className="bg-white dark:bg-slate-800 p-5 rounded-[24px] mb-4 flex-row items-center border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            {/* 1. Avatar (Fixed Width) */}
            <View className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl items-center justify-center mr-4">
              <Text className="text-indigo-600 dark:text-indigo-300 font-black text-xl">
                {member.name[0].toUpperCase()}
              </Text>
            </View>
            
            {/* 2. Info (Flexible - Fills Middle) */}
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                {member.name}
              </Text>
              <Text className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-0.5">
                {member.role}
              </Text>
            </View>

            {/* 3. Status/Action (Fixed Width - Right Aligned) */}
            <View className="items-end ml-2">
              <View className="bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-lg mb-2 border border-green-200 dark:border-green-800">
                <Text className="text-green-700 dark:text-green-400 text-[10px] font-black uppercase">
                  {member.status}
                </Text>
              </View>
              
              <TouchableOpacity 
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
                className="flex-row items-center bg-indigo-50 dark:bg-indigo-900/50 px-3 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800"
              >
                <Text className="text-indigo-600 dark:text-indigo-300 font-bold mr-1.5 text-xs">Assign</Text>
                <Ionicons name="add-circle-outline" size={16} color="#4f46e5" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* QUICK ACTION BAR */}
        <View className="flex-row justify-between mt-4 mb-12">
          <TouchableOpacity className="bg-white dark:bg-slate-800 flex-1 mr-2 p-5 rounded-3xl items-center border border-slate-200 dark:border-slate-700 shadow-sm active:bg-slate-50">
            <View className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl mb-2">
              <Ionicons name="calendar-outline" size={24} color="#4f46e5" />
            </View>
            <Text className="text-slate-900 dark:text-white font-bold text-sm">Schedules</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white dark:bg-slate-800 flex-1 ml-2 p-5 rounded-3xl items-center border border-slate-200 dark:border-slate-700 shadow-sm active:bg-slate-50">
            <View className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl mb-2">
              <Ionicons name="chatbubbles-outline" size={24} color="#4f46e5" />
            </View>
            <Text className="text-slate-900 dark:text-white font-bold text-sm">Team Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TaskAssignmentModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        staffMembers={staff.map(s => ({ id: s.id, name: s.name }))} 
      />
    </SafeAreaView>
  );
}