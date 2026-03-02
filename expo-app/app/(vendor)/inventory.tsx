// expo-app/app/(vendor)/inventory.tsx
// Real inventory + availability calendar. No mock data.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, RefreshControl,
  ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VendorApi, type AvailabilityBlock, type InventoryItemWithAvailability, type SlotAvailability, type VendorSlotSummary } from '../../services/api';
import { getSession } from '../../services/authService';

type ViewTab = 'Inventory' | 'Calendar' | 'Blocks';

export default function VendorInventoryScreen() {
  const [tab, setTab]                   = useState<ViewTab>('Inventory');
  const [vendorId, setVendorId]         = useState('');
  const [inventory, setInventory]       = useState<InventoryItemWithAvailability[]>([]);
  const [slots, setSlots]               = useState<VendorSlotSummary | null>(null);
  const [blocks, setBlocks]             = useState<AvailabilityBlock[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [addItemModal, setAddItemModal] = useState(false);
  const [addBlockModal, setAddBlockModal] = useState(false);

  // Add item form
  const [itemName, setItemName]   = useState('');
  const [itemQty, setItemQty]     = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemUnit, setItemUnit]   = useState('per unit');
  const [itemDesc, setItemDesc]   = useState('');
  const [saving, setSaving]       = useState(false);

  // Add block form
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd]     = useState('');
  const [blockReason, setBlockReason] = useState('');

  // Calendar: show current month
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadAll = async () => {
    try {
      const session = await getSession();
      if (!session?.user.vendorId) return;
      const vid = session.user.vendorId;
      setVendorId(vid);

      const today = new Date();
      const year  = today.getFullYear();
      const month = today.getMonth();

      const [inv, slotData, blockData] = await Promise.all([
        VendorApi.getInventory(vid, today.toISOString().split('T')[0]),
        VendorApi.getSlots(
          vid,
          new Date(year, month, 1).toISOString().split('T')[0],
          new Date(year, month + 1, 0).toISOString().split('T')[0]
        ),
        VendorApi.getAvailabilityBlocks(vid),
      ]);

      setInventory(inv);
      setSlots(slotData);
      setBlocks(blockData);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleAddItem = async () => {
    if (!itemName || !itemQty || !itemPrice) {
      Alert.alert('Required', 'Name, quantity, and price are required.');
      return;
    }
    setSaving(true);
    try {
      await VendorApi.addInventoryItem(vendorId, {
        name:          itemName,
        description:   itemDesc,
        totalQuantity: parseInt(itemQty),
        basePrice:     parseFloat(itemPrice),
        unit:          itemUnit,
      });
      setAddItemModal(false);
      setItemName(''); setItemQty(''); setItemPrice(''); setItemUnit('per unit'); setItemDesc('');
      await loadAll();
    } catch (e: any) {
      Alert.alert('Failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = async () => {
    if (!blockStart || !blockEnd) {
      Alert.alert('Required', 'Start and end dates are required.');
      return;
    }
    setSaving(true);
    try {
      await VendorApi.addAvailabilityBlock(vendorId, blockStart, blockEnd, blockReason);
      setAddBlockModal(false);
      setBlockStart(''); setBlockEnd(''); setBlockReason('');
      await loadAll();
    } catch (e: any) {
      Alert.alert('Failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    Alert.alert('Remove Block', 'This will make those dates available again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await VendorApi.deleteAvailabilityBlock(vendorId, blockId);
            await loadAll();
          } catch (e: any) {
            Alert.alert('Failed', e.message);
          }
        },
      },
    ]);
  };

  const slotColor = (slot: SlotAvailability) => {
    if (slot.isManuallyBlocked) return 'bg-red-100 border-red-200';
    if (!slot.isAvailable)      return 'bg-red-50 border-red-100';
    if (slot.remainingSlots === 1) return 'bg-amber-50 border-amber-100';
    return 'bg-emerald-50 border-emerald-100';
  };

  const slotTextColor = (slot: SlotAvailability) => {
    if (slot.isManuallyBlocked) return 'text-red-700';
    if (!slot.isAvailable)      return 'text-red-500';
    if (slot.remainingSlots === 1) return 'text-amber-600';
    return 'text-emerald-700';
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <Text className="text-2xl font-black text-slate-900 dark:text-white">Vendor Hub</Text>
        <View className="flex-row mt-3">
          {(['Inventory', 'Calendar', 'Blocks'] as ViewTab[]).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl items-center mr-2 ${tab === t ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-700'}`}
            >
              <Text className={`text-xs font-bold ${tab === t ? 'text-white' : 'text-slate-500'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAll} />}
        >
          {/* ── INVENTORY TAB ──────────────────────────────────────── */}
          {tab === 'Inventory' && (
            <View>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-black text-slate-900 dark:text-white">
                  {inventory.length} Items
                </Text>
                <TouchableOpacity
                  onPress={() => setAddItemModal(true)}
                  className="flex-row items-center bg-indigo-600 px-4 py-2 rounded-xl"
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text className="text-white font-bold text-xs ml-1">Add Item</Text>
                </TouchableOpacity>
              </View>

              {inventory.map(item => (
                <View
                  key={item.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="w-11 h-11 bg-indigo-50 rounded-2xl items-center justify-center mr-3">
                      <Ionicons name="cube-outline" size={22} color="#6366f1" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-900 dark:text-white text-base" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="text-slate-400 text-xs">{item.unit}</Text>
                    </View>
                    <Text className="text-indigo-600 font-black text-base">
                      ₹{Number(item.basePrice).toLocaleString()}
                    </Text>
                  </View>

                  <View className="flex-row mt-1">
                    <View className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-xl p-3 mr-2">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase">Total Stock</Text>
                      <Text className="text-slate-900 dark:text-white font-black text-xl">{item.totalQuantity}</Text>
                    </View>
                    <View className={`flex-1 rounded-xl p-3 ${item.availableQty < item.totalQuantity * 0.2 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                      <Text className="text-[10px] font-bold uppercase text-slate-500">Available Today</Text>
                      <Text className={`font-black text-xl ${item.availableQty < item.totalQuantity * 0.2 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {item.availableQty}
                      </Text>
                    </View>
                    <View className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-xl p-3 ml-2">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase">Allocated</Text>
                      <Text className="text-slate-900 dark:text-white font-black text-xl">{item.allocatedQty}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── CALENDAR TAB ───────────────────────────────────────── */}
          {tab === 'Calendar' && (
            <View>
              <Text className="text-lg font-black text-slate-900 dark:text-white mb-4">
                Slot Calendar — {calendarMonth}
              </Text>

              <View className="mb-3">
                <View className="flex-row mb-2">
                  <View className="flex-row items-center mr-4">
                    <View className="w-3 h-3 bg-emerald-400 rounded-full mr-1" />
                    <Text className="text-slate-500 text-xs">Available</Text>
                  </View>
                  <View className="flex-row items-center mr-4">
                    <View className="w-3 h-3 bg-amber-400 rounded-full mr-1" />
                    <Text className="text-slate-500 text-xs">1 slot left</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-red-400 rounded-full mr-1" />
                    <Text className="text-slate-500 text-xs">Full / Blocked</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row flex-wrap">
                {slots?.slots.map(slot => (
                  <View
                    key={slot.date}
                    className={`w-[13%] m-[1%] rounded-xl p-1.5 border items-center ${slotColor(slot)}`}
                  >
                    <Text className={`text-[9px] font-black ${slotTextColor(slot)}`}>
                      {parseInt(slot.date.split('-')[2])}
                    </Text>
                    <Text className={`text-[8px] font-bold mt-0.5 ${slotTextColor(slot)}`}>
                      {slot.isManuallyBlocked ? 'BLK' : slot.remainingSlots === 0 ? 'FULL' : `${slot.remainingSlots}S`}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4">
                <Text className="text-indigo-600 font-bold text-sm">
                  Capacity: {slots?.maxEventsPerDay} events per day
                </Text>
                <Text className="text-indigo-400 text-xs mt-1">
                  Confirmed bookings reduce available slots. Manage blocks in the Blocks tab.
                </Text>
              </View>
            </View>
          )}

          {/* ── BLOCKS TAB ─────────────────────────────────────────── */}
          {tab === 'Blocks' && (
            <View>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-black text-slate-900 dark:text-white">
                  Unavailability Blocks
                </Text>
                <TouchableOpacity
                  onPress={() => setAddBlockModal(true)}
                  className="flex-row items-center bg-red-500 px-4 py-2 rounded-xl"
                >
                  <Ionicons name="ban-outline" size={14} color="white" />
                  <Text className="text-white font-bold text-xs ml-1">Block Dates</Text>
                </TouchableOpacity>
              </View>

              {blocks.length === 0 ? (
                <View className="items-center py-12">
                  <Ionicons name="checkmark-circle-outline" size={48} color="#86efac" />
                  <Text className="text-slate-400 font-bold mt-3">No blocked dates</Text>
                  <Text className="text-slate-400 text-xs text-center mt-1">
                    You're available on all upcoming dates
                  </Text>
                </View>
              ) : (
                blocks.map(block => (
                  <View
                    key={block.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 flex-row items-center border border-red-100 dark:border-red-900/30"
                  >
                    <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="ban-outline" size={20} color="#ef4444" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-900 dark:text-white text-sm">
                        {block.startDate} → {block.endDate}
                      </Text>
                      {block.reason && (
                        <Text className="text-slate-400 text-xs mt-0.5">{block.reason}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteBlock(block.id)}
                      className="bg-red-50 p-2 rounded-xl"
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          <View className="h-28" />
        </ScrollView>
      )}

      {/* ── Add Item Modal ──────────────────────────────────────────── */}
      <Modal visible={addItemModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-slate-800 rounded-t-[32px] p-6">
            <Text className="text-xl font-black text-slate-900 dark:text-white mb-5">Add Inventory Item</Text>
            {[
              { label: 'Item Name', value: itemName, setter: setItemName, placeholder: 'e.g. Gold Chairs' },
              { label: 'Total Quantity', value: itemQty, setter: setItemQty, placeholder: '100', keyboardType: 'number-pad' as const },
              { label: 'Base Price (₹)', value: itemPrice, setter: setItemPrice, placeholder: '500', keyboardType: 'decimal-pad' as const },
              { label: 'Unit', value: itemUnit, setter: setItemUnit, placeholder: 'per chair per day' },
              { label: 'Description', value: itemDesc, setter: setItemDesc, placeholder: 'Optional description' },
            ].map(field => (
              <View key={field.label} className="mb-3">
                <Text className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase mb-1">{field.label}</Text>
                <TextInput
                  className="bg-slate-50 dark:bg-slate-700 px-4 py-3 rounded-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600"
                  placeholder={field.placeholder}
                  placeholderTextColor="#94a3b8"
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType={field.keyboardType ?? 'default'}
                />
              </View>
            ))}
            <View className="flex-row space-x-3 mt-2">
              <TouchableOpacity onPress={() => setAddItemModal(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl items-center">
                <Text className="font-bold text-slate-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddItem} disabled={saving} className={`flex-1 py-4 rounded-2xl items-center ${saving ? 'bg-indigo-400' : 'bg-indigo-600'}`}>
                {saving ? <ActivityIndicator color="white" size="small" /> : <Text className="font-bold text-white">Add Item</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Add Block Modal ─────────────────────────────────────────── */}
      <Modal visible={addBlockModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-slate-800 rounded-t-[32px] p-6">
            <Text className="text-xl font-black text-slate-900 dark:text-white mb-5">Block Dates</Text>
            {[
              { label: 'Start Date', value: blockStart, setter: setBlockStart, placeholder: 'YYYY-MM-DD' },
              { label: 'End Date',   value: blockEnd,   setter: setBlockEnd,   placeholder: 'YYYY-MM-DD' },
              { label: 'Reason',     value: blockReason, setter: setBlockReason, placeholder: 'e.g. Annual maintenance' },
            ].map(field => (
              <View key={field.label} className="mb-3">
                <Text className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase mb-1">{field.label}</Text>
                <TextInput
                  className="bg-slate-50 dark:bg-slate-700 px-4 py-3 rounded-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600"
                  placeholder={field.placeholder}
                  placeholderTextColor="#94a3b8"
                  value={field.value}
                  onChangeText={field.setter}
                />
              </View>
            ))}
            <View className="flex-row space-x-3 mt-2">
              <TouchableOpacity onPress={() => setAddBlockModal(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl items-center">
                <Text className="font-bold text-slate-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddBlock} disabled={saving} className={`flex-1 py-4 rounded-2xl items-center ${saving ? 'bg-red-400' : 'bg-red-500'}`}>
                {saving ? <ActivityIndicator color="white" size="small" /> : <Text className="font-bold text-white">Block Dates</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
