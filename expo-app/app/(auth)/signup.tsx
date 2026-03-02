// expo-app/app/(auth)/signup.tsx
// Real signup screen — calls POST /api/auth/register.
// Shows vendor-specific fields (businessName, category) when VENDOR role is selected.

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
import type { UserRole } from '../../../shared/types';
import { AuthService } from '../../services/authService';

const VENDOR_CATEGORIES = [
  'Catering', 'Decor', 'Photography', 'Videography',
  'Music & AV', 'Furniture', 'Florist', 'Transport', 'Other',
];

const ROLES: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value: 'PLANNER', label: 'Planner',  icon: 'briefcase-outline',  desc: 'Manage events for clients' },
  { value: 'VENDOR',  label: 'Vendor',   icon: 'storefront-outline',  desc: 'Offer services & inventory' },
  { value: 'CLIENT',  label: 'Client',   icon: 'person-outline',      desc: 'Host your event' },
];

export default function SignupScreen() {
  const router = useRouter();

  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [role,         setRole]         = useState<UserRole>('PLANNER');
  const [businessName, setBusinessName] = useState('');
  const [category,     setCategory]     = useState('Catering');
  const [loading,      setLoading]      = useState(false);

  const handleSignup = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password too short', 'Password must be at least 8 characters.');
      return;
    }
    if (role === 'VENDOR' && !businessName.trim()) {
      Alert.alert('Missing field', 'Please enter your business name.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await AuthService.register({
        email:     email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        role,
        ...(role === 'VENDOR' ? { businessName: businessName.trim(), category } : {}),
      });

      // Route to correct dashboard after registration
      if (user.role === 'VENDOR') {
        router.replace('/(vendor)/vendor-dashboard');
      } else if (user.role === 'CLIENT') {
        router.replace('/(client)/home');
      } else {
        router.replace('/(planner)/dashboard');
      }
    } catch (err: any) {
      Alert.alert('Registration failed', err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View className="mt-8 mb-8">
            <TouchableOpacity onPress={() => router.back()} className="mb-4 -ml-1">
              <Ionicons name="arrow-back" size={24} color="#4f46e5" />
            </TouchableOpacity>
            <Text className="text-3xl font-black text-slate-900 dark:text-white">Create Account</Text>
            <Text className="text-slate-500 dark:text-slate-400 mt-1">Join EventFlow AI</Text>
          </View>

          {/* Role Selector */}
          <Text className="text-slate-700 dark:text-slate-300 font-bold mb-3">I am a...</Text>
          <View className="flex-row gap-3 mb-6">
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRole(r.value)}
                className={`flex-1 p-3 rounded-2xl border-2 items-center ${
                  role === r.value
                    ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/30'
                    : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                }`}
              >
                <Ionicons
                  name={r.icon as any}
                  size={22}
                  color={role === r.value ? '#4f46e5' : '#94a3b8'}
                />
                <Text className={`font-bold text-xs mt-1 ${role === r.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name row */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-slate-600 dark:text-slate-300 font-semibold mb-2 text-sm">First Name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Priya"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-white"
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-600 dark:text-slate-300 font-semibold mb-2 text-sm">Last Name</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Sharma"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-white"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
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
          <View className="mb-4">
            <Text className="text-slate-600 dark:text-slate-300 font-semibold mb-2 text-sm">Password</Text>
            <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPass}
                autoComplete="new-password"
                className="flex-1 py-4 text-slate-900 dark:text-white"
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} className="p-1">
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Vendor-specific fields */}
          {role === 'VENDOR' && (
            <View className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-4 mb-4 border border-indigo-100 dark:border-indigo-800">
              <Text className="text-indigo-700 dark:text-indigo-300 font-bold mb-3 text-sm">
                Business Details
              </Text>

              {/* Business Name */}
              <View className="mb-3">
                <Text className="text-slate-600 dark:text-slate-300 font-semibold mb-2 text-sm">Business Name</Text>
                <TextInput
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="e.g. Royal Catering Co."
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                  className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-white"
                />
              </View>

              {/* Category */}
              <Text className="text-slate-600 dark:text-slate-300 font-semibold mb-2 text-sm">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
                {VENDOR_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full mr-2 border ${
                      category === cat
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-600'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${category === cat ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className="bg-indigo-600 rounded-2xl py-4 items-center shadow-lg shadow-indigo-200 mt-2"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-500 dark:text-slate-400">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-indigo-600 dark:text-indigo-400 font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
