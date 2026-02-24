import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; // Ensure this is installed
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootIndex() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        // Look for a saved role in the phone's secure storage
        const savedRole = await SecureStore.getItemAsync('userRole');
        
        if (savedRole) {
          setUserRole(savedRole);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        // Small delay to ensure smooth transition
        setTimeout(() => setIsLoading(false), 500);
      }
    }

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // 1. If no role is found in storage, send to Login
  if (!userRole) {
    return <Redirect href={"/(auth)/login" as any}  />;
  }
  // 2. Traffic Control: Redirect based on the role found in storage
  // Note: 'as any' is used to bypass temporary TS path generation lag
  // app/index.tsx
  if (userRole === 'planner') {
    return <Redirect href={"/dashboard" as any} />;
  }

  if (userRole === 'vendor') {
    // Point to the specific unique filename
    return <Redirect href={"/vendor-dashboard"as any} />;
  }

  if (userRole === 'client') {
    // Point to the specific unique filename
    return <Redirect href={"/client-dashboard" as any} />;
  }

  // Fallback (e.g. if storage is corrupted)
  return <Redirect href={"/(auth)/login" as any} />;
}