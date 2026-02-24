import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthService } from '../../../services/dataStore';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Planner' | 'Vendor' | 'Client'>('Planner');
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    const user = AuthService.login(email, role);

    if (user) {
      const rolePath = role.toLowerCase().trim();
      await SecureStore.setItemAsync('userRole', rolePath);
      
      // MATCH THE FILENAMES IN YOUR IMAGE:
      if (rolePath === 'vendor') {
        router.replace('../(vendor)/vendor-dashboard'); // Matches your file vendor-dashboard.tsx
      } else if (rolePath === 'client') {
        router.replace('../(client)/client-dashboard'); // Matches your file client-dashboard.tsx
      } else {
        router.replace('../(planner)/dashboard'); // Matches your file dashboard.tsx
      }
    } else {
      Alert.alert("Login Failed", "Invalid credentials or role selection.");
    }
  };

  const handleReset = () => {
    const result = AuthService.resetPassword(resetEmail);
    if (result.success) {
      Alert.alert("Email Sent", "Check your inbox for password reset instructions.");
      setForgotModal(false);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  return (
    <View className="flex-1 p-6 bg-white dark:bg-slate-900 justify-center">
      <View className="items-center mb-10">
        <View className="bg-indigo-600 p-4 rounded-3xl mb-4">
          <Ionicons name="flash" size={40} color="white" />
        </View>
        <Text className="text-3xl font-bold dark:text-white">EventFlow AI</Text>
        <Text className="text-slate-500 mt-2">Sign in to your workspace</Text>
      </View>

      {/* Role Selector Tabs */}
      <View className="flex-row bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
        {['Planner', 'Vendor', 'Client'].map((r) => (
          <TouchableOpacity 
            key={r}
            onPress={() => setRole(r as any)}
            className={`flex-1 py-3 rounded-xl ${role === r ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
          >
            <Text className={`text-center font-bold ${role === r ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400'}`}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Inputs */}
      <View className="space-y-4">
        <TextInput 
          placeholder="Email Address" 
          placeholderTextColor="#94a3b8"
          value={email} 
          onChangeText={setEmail}
          autoCapitalize="none"
          className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 dark:text-white"
        />

        <TouchableOpacity 
          onPress={handleLogin}
          className="bg-indigo-600 p-4 rounded-2xl items-center shadow-lg shadow-indigo-200"
        >
          <Text className="text-white font-bold text-lg">Continue as {role}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setForgotModal(true)} className="items-center pt-2">
          <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Forgot Password Modal */}
      <Modal visible={forgotModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-center p-6">
          <View className="bg-white dark:bg-slate-800 p-8 rounded-3xl">
            <Text className="text-2xl font-bold dark:text-white mb-2">Reset Password</Text>
            <Text className="text-slate-500 mb-6">Enter your email and we'll send you a recovery link.</Text>
            
            <TextInput 
              placeholder="Email Address" 
              value={resetEmail}
              onChangeText={setResetEmail}
              className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 mb-6"
            />
            
            <View className="flex-row space-x-3">
              <TouchableOpacity onPress={() => setForgotModal(false)} className="flex-1 bg-slate-100 p-4 rounded-2xl items-center">
                <Text className="font-bold text-slate-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReset} className="flex-1 bg-indigo-600 p-4 rounded-2xl items-center">
                <Text className="font-bold text-white">Send Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View className="flex-row justify-center mt-12">
        <Text className="text-slate-500">New to EventFlow? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup' as any)}>
          <Text className="text-indigo-600 font-bold">Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}