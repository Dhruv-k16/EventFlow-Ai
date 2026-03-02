// expo-app/app/index.tsx
// Auth gate — the first screen the app loads.
// Checks for a stored session. If found, routes to the correct role dashboard.
// If no session, redirects to login.

import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { StoredSession } from '../../shared/types';
import { getSession } from '../services/authService';

export default function RootIndex() {
  const [session, setSession]   = useState<StoredSession | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <View className="bg-indigo-600 w-16 h-16 rounded-3xl items-center justify-center mb-6">
          <Text className="text-white text-3xl font-black">⚡</Text>
        </View>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // No session → login
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Route to the correct role dashboard
  const role = session.user.role;

  if (role === 'PLANNER') {
    return <Redirect href="/(planner)/dashboard" />;
  }

  if (role === 'VENDOR') {
    return <Redirect href="/(vendor)/vendor-dashboard" />;
  }

  if (role === 'CLIENT') {
    return <Redirect href="/(client)/home" />;
  }

  if (role === 'ADMIN') {
    return <Redirect href="/(planner)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
