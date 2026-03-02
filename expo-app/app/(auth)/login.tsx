// expo-app/app/(auth)/login.tsx
// Real login screen — calls POST /api/auth/login.
// Role is returned from the server (not selected by the user at login).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../../services/authService';

export default function LoginScreen() {
  const router = useRouter();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await AuthService.login(email.trim().toLowerCase(), password);

      // Route to correct dashboard based on role from server
      if (user.role === 'VENDOR') {
        router.replace('/(vendor)/vendor-dashboard');
      } else if (user.role === 'CLIENT') {
        router.replace('/(client)/home');
      } else {
        // PLANNER or ADMIN
        router.replace('/(planner)/dashboard');
      }
    } catch (err: any) {
      Alert.alert('Login failed', err.message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center">

            {/* Logo */}
            <View className="items-center mb-10">
              <View className="bg-indigo-600 w-20 h-20 rounded-3xl items-center justify-center mb-4 shadow-lg shadow-indigo-300">
                <Ionicons name="flash" size={40} color="white" />
              </View>
              <Text className="text-3xl font-black text-slate-900 dark:text-white">EventFlow AI</Text>
              <Text className="text-slate-500 dark:text-slate-400 mt-1">Sign in to your workspace</Text>
            </View>

            {/* Form */}
            <View className="space-y-4">

              {/* Email */}
              <View>
                <Text className="text-slate-600 dark:text-slate-300 font-semibold mb-2 text-sm">Email Address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-white"
                />
              </View>

              {/* Password */}
              <View>
                <Text className="text-slate-600 dark:text-slate-300 font-semibold mb-2 text-sm">Password</Text>
                <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPass}
                    autoComplete="password"
                    className="flex-1 py-4 text-slate-900 dark:text-white"
                  />
                  <TouchableOpacity onPress={() => setShowPass(p => !p)} className="p-1">
                    <Ionicons
                      name={showPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign In button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="bg-indigo-600 rounded-2xl py-4 items-center mt-2 shadow-lg shadow-indigo-200"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">Sign In</Text>
                )}
              </TouchableOpacity>

            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-500 dark:text-slate-400">New to EventFlow? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text className="text-indigo-600 dark:text-indigo-400 font-bold">Create Account</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
