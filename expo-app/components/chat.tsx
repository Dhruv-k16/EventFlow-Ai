import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatScreen() {
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState([
    { id: '1', text: 'Hey! Is the floral setup ready?', sender: 'Planner' },
    { id: '2', text: 'Almost done, just finishing the arch.', sender: 'Me' },
  ]);

  const send = () => {
    if (!msg) return;
    setHistory([...history, { id: Date.now().toString(), text: msg, sender: 'Me' }]);
    setMsg('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 p-4">
        {history.map(m => (
          <View key={m.id} className={`mb-4 max-w-[80%] p-4 rounded-2xl ${m.sender === 'Me' ? 'bg-indigo-600 self-end' : 'bg-white self-start'}`}>
            <Text className={m.sender === 'Me' ? 'text-white' : 'text-slate-800'}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View className="p-4 bg-white flex-row items-center border-t border-slate-100">
        <TextInput value={msg} onChangeText={setMsg} placeholder="Type a message..." className="flex-1 bg-slate-100 p-3 rounded-xl mr-2" />
        <TouchableOpacity onPress={send} className="bg-indigo-600 p-3 rounded-xl">
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}