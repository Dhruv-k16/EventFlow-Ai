import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ChatScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Mock conversation history
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi! I have a question about the catering menu.', sender: 'client', time: '10:30 AM' },
    { id: '2', text: 'Sure! I am here to help. What would you like to know?', sender: 'planner', time: '10:32 AM' },
    { id: '3', text: 'Can we add a vegan option for the appetizers?', sender: 'client', time: '10:35 AM' },
  ]);

  const sendMessage = () => {
    if (message.trim().length === 0) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'client',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Auto-scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      {/* Custom Header */}
      <View className="flex-row items-center p-4 border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#6366f1" />
        </TouchableOpacity>
        <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
          <Ionicons name="person" size={20} color="#4f46e5" />
        </View>
        <View>
          <Text className="font-bold text-lg dark:text-white">Lead Planner</Text>
          <Text className="text-green-500 text-xs font-bold uppercase">Online</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 p-4"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              className={`mb-4 max-w-[80%] rounded-2xl p-4 ${
                msg.sender === 'client' 
                  ? 'bg-indigo-600 self-end rounded-tr-none' 
                  : 'bg-slate-100 dark:bg-slate-800 self-start rounded-tl-none'
              }`}
            >
              <Text className={`${msg.sender === 'client' ? 'text-white' : 'text-slate-800 dark:text-slate-200'} text-base`}>
                {msg.text}
              </Text>
              <Text className={`text-[10px] mt-1 ${msg.sender === 'client' ? 'text-indigo-200' : 'text-slate-400'} self-end`}>
                {msg.time}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-row items-center">
          <TouchableOpacity className="mr-3">
            <Ionicons name="add-circle-outline" size={28} color="#6366f1" />
          </TouchableOpacity>
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#94a3b8"
            className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-white p-3 rounded-2xl mr-3 max-h-24"
            multiline
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity 
            onPress={sendMessage}
            className={`p-3 rounded-full ${message.trim().length > 0 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}