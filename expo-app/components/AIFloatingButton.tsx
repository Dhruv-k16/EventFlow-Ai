import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AIFloatingButton() {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your EventFlow Assistant. How can I help you manage your event today?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    // Simulate AI thinking
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'I am analyzing your event timeline... Everything looks on track for the Modern Wedding Expo!' }]);
    }, 1000);
  };

  return (
    <>
      {/* The Floating Trigger */}
      <TouchableOpacity 
        onPress={() => setVisible(true)}
        className="absolute bottom-24 right-6 bg-indigo-600 w-16 h-16 rounded-full items-center justify-center shadow-xl z-50"
      >
        <Ionicons name="sparkles" size={30} color="white" />
      </TouchableOpacity>

      {/* The Chat Modal */}
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="bg-white dark:bg-slate-900 rounded-t-3xl h-[80%] p-5"
          >
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="bg-indigo-100 p-2 rounded-lg mr-2">
                  <Ionicons name="sparkles" size={20} color="#4f46e5" />
                </View>
                <Text className="text-xl font-bold dark:text-white">EventFlow AI</Text>
              </View>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            <ScrollView className="flex-1 mb-4">
              {messages.map((m, i) => (
                <View key={i} className={`mb-4 max-w-[80%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}>
                  <View className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <Text className={`${m.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                      {m.text}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Input Area */}
            <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2 mb-6">
              <TextInput 
                className="flex-1 h-12 dark:text-white"
                placeholder="Ask anything..."
                placeholderTextColor="#94a3b8"
                value={input}
                onChangeText={setInput}
              />
              <TouchableOpacity onPress={sendMessage} className="bg-indigo-600 p-2 rounded-xl">
                <Ionicons name="arrow-up" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}