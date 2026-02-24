import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'planner' | 'vendor' | 'client'>('planner');
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Simulate creating a user object
    const userData = { email, password, role };
    
    // Save credentials to local storage as a string
    await SecureStore.setItemAsync('registeredUser', JSON.stringify(userData));
    
    Alert.alert("Success", "Account created! Please login.", [
      { text: "OK", onPress: () => router.push('/(auth)/login') }
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <View className="mt-10">
        <Text className="text-3xl font-bold text-slate-900 mb-2">Create Account</Text>
        <Text className="text-slate-500 mb-8">Join EventFlow AI today</Text>

        <TextInput
          className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        
        <TextInput
          className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text className="font-bold mb-3 text-slate-700">Select Your Role:</Text>
        <View className="flex-row justify-between mb-8">
          {['planner', 'vendor', 'client'].map((r) => (
            <TouchableOpacity 
              key={r}
              onPress={() => setRole(r as any)}
              className={`p-3 rounded-lg w-[31%] items-center border ${role === r ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
            >
              <Text className={`capitalize font-bold text-xs ${role === r ? 'text-white' : 'text-slate-600'}`}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleSignUp} className="bg-indigo-600 p-4 rounded-2xl items-center shadow-lg shadow-indigo-200">
          <Text className="text-white font-bold text-lg">Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="mt-6 items-center">
          <Text className="text-slate-500">Already have an account? <Text className="text-indigo-600 font-bold">Login</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}