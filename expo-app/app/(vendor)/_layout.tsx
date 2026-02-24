import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function VendorLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#4f46e5',
      headerShown: true,
      tabBarStyle: { height: 60, paddingBottom: 10 }
    }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Vendor Portal',
          tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color }) => <Ionicons name="card" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="staff"
        options={{
          title: 'Staff',
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
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
        name="timeline"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}