import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AIFloatingButton from '../../components/AIFloatingButton'; // ✅ Fixed: was ../components/

export default function PlannerLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <Tabs screenOptions={{
          tabBarActiveTintColor: '#4f46e5',
          tabBarInactiveTintColor: '#94a3b8',
          headerShown: false,
          tabBarStyle: {
            height: 70,
            paddingBottom: 12,
            paddingTop: 8,
            backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#ffffff',
            borderTopColor: colorScheme === 'dark' ? '#1e293b' : '#f1f5f9',
            borderTopWidth: 1,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          }
        }}>
          <Tabs.Screen
            name="dashboard"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color }) => <Ionicons name="grid" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="timeline"
            options={{
              title: 'Timeline',
              tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="create-event"
            options={{
              title: 'Create Event',
              tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="events"
            options={{
              title: 'Events',
              tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="staff"
            options={{
              title: 'Team',
              tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="marketplace"
            options={{
              title: 'Marketplace',
              tabBarIcon: ({ color }) => <Ionicons name="storefront-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="event-detail"
            options={{ href: null }}
          />
        </Tabs>

        <AIFloatingButton />
      </View>
    </SafeAreaProvider>
  );
}
