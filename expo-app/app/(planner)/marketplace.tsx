// expo-app/app/(planner)/marketplace.tsx
// Live marketplace screen. Reads from real API — no mock data.
// Shows vendor slot availability per SRS requirements.

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { InventoryItem, MarketplaceVendor } from '../../../shared/types';
import { BookingApi, VendorApi } from '../../services/api';

const CATEGORIES = ['All', 'Catering', 'Decor', 'AV', 'Photography', 'Floral'];

// Colour map for slot badge
function slotBadgeStyle(vendor: MarketplaceVendor & { availableSlots: number; isAvailable: boolean }) {
  if (!vendor.isAvailable) return { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' };
  if (vendor.availableSlots === 1) return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
  return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
}

export default function MarketplaceScreen() {
  const router  = useRouter();
  const params  = useLocalSearchParams<{ query?: string; category?: string }>();

  const [category, setCategory]     = useState(params.category ?? 'All');
  const [query, setQuery]           = useState(params.query ?? '');
  const [date, setDate]             = useState(() => new Date().toISOString().split('T')[0]);
  const [vendors, setVendors]       = useState<(MarketplaceVendor & { availableSlots: number; totalSlots: number; isAvailable: boolean; slotLabel: string })[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [selected, setSelected]     = useState<{ item: InventoryItem; vendor: MarketplaceVendor } | null>(null);
  const [qty, setQty]               = useState('1');
  const [eventId, setEventId]       = useState('');
  const [booking, setBooking]       = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchVendors = async (q = query, cat = category, d = date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await VendorApi.list({ date: d, category: cat, query: q });
      setVendors(data as any);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount and whenever category/date changes
  useEffect(() => { fetchVendors(); }, [category, date]);

  // Debounce query input
  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchVendors(text), 500);
  };

  const handleBook = async () => {
    if (!selected) return;
    if (!eventId.trim()) {
      Alert.alert('Event ID required', 'Enter the event ID to attach this booking.');
      return;
    }
    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity < 1) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity.');
      return;
    }

    setBooking(true);
    try {
      await BookingApi.create({
        eventId,
        vendorId: selected.vendor.id,
        items: [{ inventoryItemId: selected.item.id, quantity }],
      });
      Alert.alert(
        '✅ Booking Requested',
        `"${selected.item.name}" request sent to ${selected.vendor.businessName}. Status: REQUESTED — meeting will be scheduled.`,
        [{ text: 'OK', onPress: () => setSelected(null) }]
      );
    } catch (e: any) {
      Alert.alert('Booking Failed', e.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View className="bg-white dark:bg-slate-800 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#6366f1" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900 dark:text-white flex-1">Marketplace</Text>
          <View className="bg-indigo-50 px-2 py-1 rounded-lg">
            <Text className="text-indigo-600 text-xs font-bold">{vendors.length} vendors</Text>
          </View>
        </View>

        {/* Search bar */}
        <View className="flex-row items-center bg-slate-50 dark:bg-slate-700 rounded-2xl px-4 border border-slate-200 dark:border-slate-600 mb-3">
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput
            className="flex-1 py-3 ml-2 text-slate-900 dark:text-white"
            placeholder="Search items, vendors…"
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={handleQueryChange}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); fetchVendors(''); }}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Date picker */}
        <View className="flex-row items-center bg-indigo-50 dark:bg-slate-700 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="calendar-outline" size={16} color="#6366f1" />
          <TextInput
            className="flex-1 ml-2 text-slate-700 dark:text-white text-sm font-medium"
            placeholder="Event date (YYYY-MM-DD)"
            placeholderTextColor="#94a3b8"
            value={date}
            onChangeText={setDate}
            onSubmitEditing={() => fetchVendors()}
            returnKeyType="search"
          />
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              className={`mr-2 px-4 py-2 rounded-full ${category === cat ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-700'}`}
            >
              <Text className={`text-xs font-bold ${category === cat ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-slate-400 mt-3">Loading vendors…</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={48} color="#f87171" />
          <Text className="text-red-500 font-bold mt-3 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchVendors()}
            className="mt-4 bg-indigo-600 px-6 py-3 rounded-2xl"
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {vendors.length === 0 ? (
            <View className="items-center mt-20">
              <Ionicons name="storefront-outline" size={56} color="#cbd5e1" />
              <Text className="text-slate-400 font-bold mt-4 text-lg">No vendors found</Text>
              <Text className="text-slate-400 text-sm text-center mt-1">
                Try a different date, category, or search term
              </Text>
            </View>
          ) : (
            vendors.map(vendor => {
              const badge = slotBadgeStyle(vendor);
              return (
                <View
                  key={vendor.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl mb-5 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
                >
                  {/* Vendor header */}
                  <View className="p-5 pb-3">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1 mr-3">
                        <View className="bg-indigo-50 dark:bg-indigo-900/30 self-start px-2 py-0.5 rounded-full mb-1">
                          <Text className="text-indigo-600 text-[10px] font-black uppercase">{vendor.category}</Text>
                        </View>
                        <Text className="text-lg font-black text-slate-900 dark:text-white" numberOfLines={1}>
                          {vendor.businessName}
                        </Text>
                        <Text className="text-slate-500 text-xs mt-0.5">{vendor.location}</Text>
                      </View>
                      <View className="items-end">
                        <View className="bg-indigo-50 px-2 py-1 rounded-lg mb-1">
                          <Text className="text-indigo-600 font-bold text-xs">{Number(vendor.rating).toFixed(1)} ★</Text>
                        </View>
                      </View>
                    </View>

                    {/* SRS: Slot availability badge */}
                    <View className={`flex-row items-center px-3 py-1.5 rounded-xl self-start ${badge.bg}`}>
                      <View className={`w-2 h-2 rounded-full mr-2 ${badge.dot}`} />
                      <Text className={`text-xs font-bold ${badge.text}`}>
                        {vendor.isAvailable
                          ? `Capable of ${vendor.totalSlots} events/day • ${vendor.availableSlots} slot${vendor.availableSlots !== 1 ? 's' : ''} available`
                          : vendor.slotLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Inventory items */}
                  {vendor.inventory.map((item, idx) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => vendor.isAvailable && setSelected({ item, vendor })}
                      disabled={!vendor.isAvailable}
                      className={`mx-4 mb-3 p-4 rounded-2xl border flex-row items-center ${
                        !vendor.isAvailable
                          ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700 opacity-60'
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600 active:bg-indigo-50'
                      }`}
                    >
                      <View className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="cube-outline" size={20} color="#6366f1" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-slate-900 dark:text-white text-sm" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text className="text-slate-400 text-[10px] mt-0.5">
                          {item.availableQty} of {item.totalQuantity} available • {item.unit}
                        </Text>
                      </View>
                      <View className="items-end ml-2">
                        <Text className="text-indigo-600 font-black text-sm">
                          ₹{Number(item.basePrice).toLocaleString()}
                        </Text>
                        {vendor.isAvailable && (
                          <View className="bg-indigo-600 px-2 py-0.5 rounded-lg mt-1">
                            <Text className="text-white text-[10px] font-bold">Book</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                  <View className="h-2" />
                </View>
              );
            })
          )}
          <View className="h-24" />
        </ScrollView>
      )}

      {/* ── Booking bottom sheet ────────────────────────────────────────── */}
      {selected && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-[32px] p-6 shadow-2xl border-t border-slate-100 dark:border-slate-700">
          <View className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full self-center mb-5" />

          <Text className="text-xl font-black text-slate-900 dark:text-white mb-1">
            {selected.item.name}
          </Text>
          <Text className="text-slate-500 text-sm mb-5">
            {selected.vendor.businessName} • {selected.item.unit}
          </Text>

          {/* Event ID input */}
          <Text className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase mb-1.5">Event ID</Text>
          <View className="bg-slate-50 dark:bg-slate-700 flex-row items-center px-4 rounded-2xl border border-slate-200 dark:border-slate-600 mb-4">
            <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
            <TextInput
              className="flex-1 py-3 ml-2 text-slate-900 dark:text-white text-sm"
              placeholder="Paste event ID here"
              placeholderTextColor="#94a3b8"
              value={eventId}
              onChangeText={setEventId}
              autoCapitalize="none"
            />
          </View>

          {/* Quantity + price */}
          <View className="flex-row items-center mb-5">
            <View className="flex-1 mr-3">
              <Text className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase mb-1.5">Quantity</Text>
              <View className="bg-slate-50 dark:bg-slate-700 flex-row items-center px-4 rounded-2xl border border-slate-200 dark:border-slate-600">
                <Ionicons name="layers-outline" size={16} color="#94a3b8" />
                <TextInput
                  className="flex-1 py-3 ml-2 text-slate-900 dark:text-white text-sm"
                  placeholder="1"
                  placeholderTextColor="#94a3b8"
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs uppercase font-bold mb-1">Total</Text>
              <Text className="text-indigo-600 font-black text-2xl">
                ₹{(Number(selected.item.basePrice) * (parseInt(qty) || 0)).toLocaleString()}
              </Text>
            </View>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => setSelected(null)}
              className="flex-1 bg-slate-100 dark:bg-slate-700 py-4 rounded-2xl items-center"
            >
              <Text className="font-bold text-slate-600 dark:text-slate-300">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBook}
              disabled={booking}
              className={`flex-1 py-4 rounded-2xl items-center ${booking ? 'bg-indigo-400' : 'bg-indigo-600'}`}
            >
              {booking
                ? <ActivityIndicator color="white" size="small" />
                : <Text className="font-bold text-white">Send Request</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
