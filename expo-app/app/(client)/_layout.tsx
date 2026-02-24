import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function ClientLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#4f46e5',
      headerShown: true,
      tabBarStyle: { height: 65, paddingBottom: 10 }
    }}>
      {/* 1. NEW HOME TAB (Marketplace) */}
      <Tabs.Screen
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />

      {/* 2. CLIENT DASHBOARD (Event Progress) */}
      <Tabs.Screen
        name="client-dashboard" 
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <Ionicons name="analytics-outline" size={24} color={color} />,
        }}
      />

      {/* 3. MY EVENT (Vendors List) */}
      <Tabs.Screen
        name="my-event" 
        options={{
          title: 'My Event',
          tabBarIcon: ({ color }) => <Ionicons name="star-outline" size={24} color={color} />,
        }}
      />
      
      {/* 4. SCHEDULE (Timeline) */}
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} />,
        }}
      />
      
      {/* 5. SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}