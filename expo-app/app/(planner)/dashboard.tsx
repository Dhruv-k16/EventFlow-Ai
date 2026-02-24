import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WeatherWidget from '../components/WeatherWidget';

const KPICard = ({ title, value, icon, color }: any) => (
  <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm mb-4 w-[48%] border border-slate-100 dark:border-slate-700">
    <View className={`w-10 h-10 rounded-full items-center justify-center mb-2 ${color}`}>
      <Ionicons name={icon} size={20} color="white" />
    </View>
    <Text className="text-slate-500 text-xs font-medium uppercase">{title}</Text>
    <Text className="text-slate-900 dark:text-white text-xl font-bold mt-1">{value}</Text>
  </View>
);

export default function PlannerDashboard() {
  const router = useRouter();
  const recentActivities = [
    { id: '1', title: 'Vendor Payment: Catering', subtitle: 'Modern Wedding Expo • 2h ago' },
    { id: '2', title: 'Contract Signed', subtitle: 'Johnson Anniversary • 4h ago' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
      <ScrollView className="flex-1 px-4">
        {/* Header Section */}
        <View className="flex-row justify-between items-center mt-4 mb-6">
          <View>
            <Text className="text-slate-900 dark:text-white text-2xl font-bold">Hello, Alex</Text>
            <Text className="text-slate-500">You have 3 events today</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications' as any)} className="bg-indigo-600 p-2.5 rounded-full">
            <Ionicons name="notifications" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <WeatherWidget />

        {/* KPI Grid */}
        <View className="flex-row flex-wrap justify-between mt-4">
          <KPICard title="Upcoming" value="12" icon="calendar" color="bg-blue-500" />
          <KPICard title="Tasks" value="48" icon="checkbox" color="bg-orange-500" />
        </View>

        {/* AI Action */}
        <TouchableOpacity className="bg-indigo-600 rounded-3xl p-5 my-6 flex-row items-center justify-between shadow-lg shadow-indigo-200">
          <View className="flex-row items-center">
            <View className="bg-white/20 p-2 rounded-lg mr-3">
              <Ionicons name="sparkles" size={20} color="white" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">EventFlow AI</Text>
              <Text className="text-indigo-100 text-xs">Optimize my timeline</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Recent Activity Header: Fixed with side-balancing */}
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="text-slate-900 dark:text-white text-xl font-bold flex-1">Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/notifications' as any)}>
            <Text className="text-indigo-600 font-bold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {recentActivities.map((activity) => (
          <TouchableOpacity 
            key={activity.id} 
            className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 flex-row items-center border border-slate-100 dark:border-slate-700"
          >
            <View className="w-1.5 h-10 bg-indigo-500 rounded-full mr-4" />
            <View className="flex-1">
              <Text className="text-slate-900 dark:text-white font-semibold text-base">{activity.title}</Text>
              <Text className="text-slate-500 text-xs mt-1">{activity.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>
        ))}

        {/* Create Button with explicit Icon visibility */}
        <TouchableOpacity 
          onPress={() => router.push('/(planner)/create-event' as any)}
          className="bg-indigo-600 flex-row items-center justify-center p-5 rounded-3xl shadow-md shadow-indigo-300 mt-6 mb-12"
        >
          <Ionicons name="add-circle-outline" size={26} color="white" />
          <Text className="text-white font-bold ml-2 text-lg">Create New Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}