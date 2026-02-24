import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  staffMembers: { id: string, name: string }[];
}

export default function TaskAssignmentModal({ visible, onClose, staffMembers }: Props) {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState('Medium');

  const priorities = ['Low', 'Medium', 'High'];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 h-[70%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold dark:text-white">Assign New Task</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Task Name */}
            <Text className="text-slate-500 font-bold mb-2">Task Description</Text>
            <TextInput 
              placeholder="e.g. Set up the audio equipment"
              className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-6 dark:text-white"
              value={taskName}
              onChangeText={setTaskName}
            />

            {/* Select Staff */}
            <Text className="text-slate-500 font-bold mb-2">Assign To</Text>
            <View className="flex-row flex-wrap mb-6">
              {staffMembers.map((staff) => (
                <TouchableOpacity 
                  key={staff.id}
                  onPress={() => setSelectedStaff(staff.name)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full border ${selectedStaff === staff.name ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                >
                  <Text className={selectedStaff === staff.name ? 'text-white' : 'text-slate-600'}>{staff.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Priority Select */}
            <Text className="text-slate-500 font-bold mb-2">Priority Level</Text>
            <View className="flex-row mb-8">
              {priorities.map((p) => (
                <TouchableOpacity 
                  key={p}
                  onPress={() => setPriority(p)}
                  className={`flex-1 mx-1 p-3 rounded-xl items-center border ${priority === p ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-200'}`}
                >
                  <Text className={priority === p ? 'text-white font-bold' : 'text-slate-500'}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              className="bg-indigo-600 p-4 rounded-2xl items-center shadow-lg"
              onPress={() => {
                alert(`Task assigned to ${selectedStaff}`);
                onClose();
              }}
            >
              <Text className="text-white font-bold text-lg">Send Assignment</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}