// expo-app/app/(vendor)/vendor-dashboard.tsx
// Vendor sees their real REQUESTED → CONFIRMED bookings from the API.
// Actions advance the SRS booking lifecycle.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, RefreshControl,
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Booking } from '../../../shared/types';
import { BookingApi } from '../../services/api';
import { getSession } from '../../services/authService';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  REQUESTED:            { bg: 'bg-blue-50',    text: 'text-blue-600'    },
  MEETING_PHASE_1:      { bg: 'bg-purple-50',  text: 'text-purple-600'  },
  CONFIRMATION_PENDING: { bg: 'bg-amber-50',   text: 'text-amber-600'   },
  MEETING_PHASE_2:      { bg: 'bg-orange-50',  text: 'text-orange-600'  },
  CONFIRMED:            { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  REJECTED_CAPACITY:    { bg: 'bg-red-50',     text: 'text-red-600'     },
  CANCELLED:            { bg: 'bg-slate-50',   text: 'text-slate-400'   },
  COMPLETED:            { bg: 'bg-slate-50',   text: 'text-slate-600'   },
};

const STATUS_LABELS: Record<string, string> = {
  REQUESTED:            'New Request',
  MEETING_PHASE_1:      'Meeting 1 Scheduled',
  CONFIRMATION_PENDING: 'Awaiting Confirmation',
  MEETING_PHASE_2:      'Meeting 2 Scheduled',
  CONFIRMED:            'Confirmed',
  REJECTED_CAPACITY:    'Rejected',
  CANCELLED:            'Cancelled',
  COMPLETED:            'Completed',
};

type FilterTab = 'Active' | 'Confirmed' | 'Completed';

export default function VendorDashboard() {
  const [tab, setTab]           = useState<FilterTab>('Active');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vendorName, setVendorName] = useState('');

  const loadBookings = async () => {
    try {
      const session = await getSession();
      if (session) {
        setVendorName(`${session.user.firstName}`);
      }
      const data = await BookingApi.getVendorBookings();
      setBookings(data);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const onRefresh = () => { setRefreshing(true); loadBookings(); };

  const handleAdvance = async (booking: Booking, nextStatus: string, label: string) => {
    Alert.alert(
      `Move to "${label}"?`,
      `This will update the booking status to ${label}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await BookingApi.updateStatus(booking.id, nextStatus);
              await loadBookings();
            } catch (e: any) {
              Alert.alert('Failed', e.message);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (bookingId: string) => {
    Alert.alert(
      'Reject Booking',
      'Explain why this booking cannot be fulfilled:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await BookingApi.updateStatus(bookingId, 'REJECTED_CAPACITY', 'Vendor capacity exceeded');
              await loadBookings();
            } catch (e: any) {
              Alert.alert('Failed', e.message);
            }
          },
        },
      ]
    );
  };

  const activeStatuses    = ['REQUESTED', 'MEETING_PHASE_1', 'CONFIRMATION_PENDING', 'MEETING_PHASE_2'];
  const confirmedStatuses = ['CONFIRMED'];
  const completedStatuses = ['COMPLETED', 'CANCELLED', 'REJECTED_CAPACITY'];

  const filteredBookings = bookings.filter(b => {
    if (tab === 'Active')    return activeStatuses.includes(b.status);
    if (tab === 'Confirmed') return confirmedStatuses.includes(b.status);
    return completedStatuses.includes(b.status);
  });

  // Next action for each status (SRS lifecycle)
  const getActions = (b: Booking) => {
    switch (b.status) {
      case 'REQUESTED':
        return [
          { label: 'Schedule Meeting 1', status: 'MEETING_PHASE_1', primary: true },
          { label: 'Reject',             status: 'reject',           primary: false },
        ];
      case 'MEETING_PHASE_1':
        return [
          { label: 'Request Confirmation', status: 'CONFIRMATION_PENDING', primary: true },
        ];
      case 'CONFIRMATION_PENDING':
        return [
          { label: 'Schedule Meeting 2', status: 'MEETING_PHASE_2', primary: true },
          { label: 'Confirm Now',         status: 'CONFIRMED',       primary: false },
          { label: 'Reject',              status: 'reject',          primary: false },
        ];
      case 'MEETING_PHASE_2':
        return [
          { label: 'Confirm Booking', status: 'CONFIRMED',         primary: true },
          { label: 'Reject',          status: 'reject',            primary: false },
        ];
      case 'CONFIRMED':
        return [
          { label: 'Mark Completed', status: 'COMPLETED', primary: true },
          { label: 'Cancel',         status: 'CANCELLED', primary: false },
        ];
      default:
        return [];
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Vendor Portal</Text>
        <Text className="text-2xl font-black text-slate-900 dark:text-white">
          Welcome, {vendorName}
        </Text>
        {/* Quick stats */}
        <View className="flex-row mt-3 space-x-3">
          {[
            { label: 'Active',    count: bookings.filter(b => activeStatuses.includes(b.status)).length,    color: 'bg-blue-600' },
            { label: 'Confirmed', count: bookings.filter(b => b.status === 'CONFIRMED').length,             color: 'bg-emerald-600' },
            { label: 'Completed', count: bookings.filter(b => b.status === 'COMPLETED').length,            color: 'bg-slate-400' },
          ].map(stat => (
            <View key={stat.label} className="flex-row items-center bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-xl mr-2">
              <View className={`w-2 h-2 rounded-full mr-1.5 ${stat.color}`} />
              <Text className="text-slate-600 dark:text-slate-300 text-xs font-bold">
                {stat.count} {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tab filter */}
      <View className="flex-row bg-white dark:bg-slate-800 px-4 pb-3 border-b border-slate-100 dark:border-slate-700">
        {(['Active', 'Confirmed', 'Completed'] as FilterTab[]).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl items-center mr-2 ${tab === t ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-700'}`}
          >
            <Text className={`text-xs font-bold ${tab === t ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredBookings.length === 0 ? (
            <View className="items-center mt-20">
              <Ionicons name="calendar-outline" size={56} color="#cbd5e1" />
              <Text className="text-slate-400 font-bold mt-4">No {tab.toLowerCase()} bookings</Text>
            </View>
          ) : (
            filteredBookings.map(booking => {
              const style   = STATUS_COLORS[booking.status] ?? STATUS_COLORS.CANCELLED;
              const actions = getActions(booking);

              return (
                <View
                  key={booking.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                  {/* Status badge */}
                  <View className="flex-row justify-between items-start mb-3">
                    <View className={`px-3 py-1 rounded-full ${style.bg}`}>
                      <Text className={`text-[10px] font-black uppercase ${style.text}`}>
                        {STATUS_LABELS[booking.status]}
                      </Text>
                    </View>
                    <Text className="text-slate-400 text-[10px]">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* Event info */}
                  <Text className="text-lg font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                    {booking.event?.name ?? 'Event'}
                  </Text>
                  <View className="flex-row items-center mt-1 mb-3">
                    <Ionicons name="calendar-outline" size={13} color="#94a3b8" />
                    <Text className="text-slate-400 text-xs ml-1">
                      {booking.event?.startDate
                        ? new Date(booking.event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </Text>
                  </View>

                  {/* Items summary */}
                  <View className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-3 mb-3">
                    {booking.items.slice(0, 2).map(item => (
                      <View key={item.id} className="flex-row justify-between py-1">
                        <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium" numberOfLines={1}>
                          {item.inventoryItem.name}
                        </Text>
                        <Text className="text-slate-500 text-sm">×{item.quantity}</Text>
                      </View>
                    ))}
                    {booking.items.length > 2 && (
                      <Text className="text-indigo-500 text-xs mt-1">+{booking.items.length - 2} more</Text>
                    )}
                    <View className="border-t border-slate-200 dark:border-slate-600 mt-2 pt-2 flex-row justify-between">
                      <Text className="text-slate-500 text-xs font-bold">Total</Text>
                      <Text className="text-slate-900 dark:text-white text-sm font-black">
                        ₹{Number(booking.totalCost).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Meeting count */}
                  {booking.meetings?.length > 0 && (
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="videocam-outline" size={14} color="#6366f1" />
                      <Text className="text-indigo-600 text-xs font-semibold ml-1">
                        {booking.meetings.filter(m => m.status === 'COMPLETED').length}/{booking.meetings.length} meetings done
                      </Text>
                    </View>
                  )}

                  {/* Action buttons */}
                  {actions.length > 0 && (
                    <View className="flex-row flex-wrap gap-2">
                      {actions.map(action => (
                        <TouchableOpacity
                          key={action.status}
                          onPress={() =>
                            action.status === 'reject'
                              ? handleReject(booking.id)
                              : handleAdvance(booking, action.status, action.label)
                          }
                          className={`px-4 py-2.5 rounded-xl ${
                            action.primary ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-700'
                          }`}
                        >
                          <Text className={`text-xs font-bold ${action.primary ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                            {action.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
          <View className="h-24" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
