import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { DataService, Event } from '../../services/dataStore';

export default function VendorJobsScreen() {
  const [activeTab, setActiveTab] = useState<'Requests' | 'Confirmed'>('Requests');
  const [jobs, setJobs] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // In a real app, this category would come from the user's profile
  const vendorCategory = 'Catering'; 

  const loadJobs = () => {
    const allVendorJobs = DataService.getVendorJobs(vendorCategory);
    if (activeTab === 'Requests') {
      setJobs(allVendorJobs.filter(j => j.status === 'Requested'));
    } else {
      setJobs(allVendorJobs.filter(j => j.status === 'Confirmed'));
    }
  };

  useEffect(() => {
    loadJobs();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAction = (eventId: string, action: 'Accept' | 'Decline') => {
    if (action === 'Accept') {
      DataService.updateEventStatus(eventId, 'Confirmed');
      Alert.alert("Job Confirmed", "This event has been added to your schedule.");
    } else {
      // In a mock setup, we just hide it or change status
      DataService.updateEventStatus(eventId, 'Planning');
      Alert.alert("Job Declined", "The planner will be notified.");
    }
    loadJobs(); // Refresh list
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Header & Tabs */}
      <View className="bg-white dark:bg-slate-800 p-6 pb-2 shadow-sm">
        <Text className="text-2xl font-bold dark:text-white mb-4">Event Jobs</Text>
        <View className="flex-row bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
          {(['Requests', 'Confirmed'] as const).map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`}
            >
              <Text className={`font-bold ${activeTab === tab ? 'text-indigo-600 dark:text-white' : 'text-slate-500'}`}>
                {tab} {tab === 'Requests' && jobs.length > 0 && `(${jobs.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {jobs.length === 0 ? (
          <View className="items-center mt-20">
            <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4 text-lg">No {activeTab.toLowerCase()} found</Text>
          </View>
        ) : (
          jobs.map((job) => (
            <View key={job.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold dark:text-white">{job.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="location-outline" size={14} color="#64748b" />
                    <Text className="text-slate-500 ml-1">{job.location}</Text>
                  </View>
                </View>
                <View className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                  <Text className="text-indigo-600 dark:text-indigo-300 font-bold text-xs">{job.date}</Text>
                </View>
              </View>

              {activeTab === 'Requests' ? (
                <View className="flex-row space-x-3">
                  <TouchableOpacity 
                    onPress={() => handleAction(job.id, 'Decline')}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 p-3 rounded-xl items-center"
                  >
                    <Text className="text-slate-600 dark:text-slate-300 font-bold">Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleAction(job.id, 'Accept')}
                    className="flex-1 bg-indigo-600 p-3 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold">Accept Job</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity className="flex-row items-center justify-center bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                  <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                  <Text className="text-green-600 dark:text-green-400 font-bold ml-2">Confirmed • View Details</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}