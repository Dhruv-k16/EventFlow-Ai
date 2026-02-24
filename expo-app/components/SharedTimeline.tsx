import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Added for notch safety
import { DataService, TimelineItem } from '../../services/dataStore';
import { exportTimelineToPDF } from '../../utils/pdfGenerator';

interface Props {
  items: TimelineItem[];
  eventId: string;
  canEdit: boolean;
  onRefresh: () => void;
}

export default function SharedTimeline({ items, eventId, canEdit, onRefresh }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  // --- Auto-Refresh Logic ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isExporting) {
        onRefresh();
      }
    }, 30000); 
    return () => clearInterval(interval);
  }, [onRefresh, isExporting]);

  // --- PDF Export Handler ---
  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportTimelineToPDF("Event Timeline", filteredItems);
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setTimeout(() => setIsExporting(false), 2000);
    }
  };

  // --- Toast Logic ---
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showToast = (message: string) => {
    setToastMsg(message);
    setToastVisible(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setToastVisible(false);
      });
    }, 2500);
  };

  const filteredItems = items.filter(item => 
    item.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cycleStatus = (itemId: string, activityName: string, currentStatus: string) => {
    const nextStatus: TimelineItem['status'] = 
      currentStatus === 'Pending' ? 'In Progress' : 
      currentStatus === 'In Progress' ? 'Completed' : 'Pending';
    
    DataService.updateTimelineStatus(eventId, itemId, nextStatus);
    showToast(`${activityName} is now ${nextStatus}`);
    onRefresh();
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={['top']}>
      
      {/* HEADER SECTION: Fixed Search & Export Alignment */}
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        
        {/* Left: Search Bar (Flexible) */}
        <View className="flex-1 flex-row items-center bg-slate-100 dark:bg-slate-800 px-4 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 mr-3">
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput 
            placeholder="Search activities..."
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-2 dark:text-white h-full"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Right: Export Button (Fixed Width) */}
        <TouchableOpacity 
          onPress={handleExport}
          disabled={isExporting}
          activeOpacity={0.7}
          className={`${isExporting ? 'bg-indigo-400' : 'bg-indigo-600'} w-12 h-12 rounded-2xl justify-center items-center shadow-sm`}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="share-outline" size={22} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* TIMELINE LIST */}
      <ScrollView className="flex-1 p-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <View key={item.id} className="flex-row mb-8">
              {/* Timeline Indicator */}
              <View className="items-center mr-4 w-12">
                <View className="bg-indigo-600 px-2 py-1 rounded-lg mb-1">
                  <Text className="text-white font-bold text-[10px]">{item.time}</Text>
                </View>
                {index !== filteredItems.length - 1 && <View className="w-[2px] flex-1 bg-slate-100 dark:bg-slate-800" />}
              </View>

              {/* Card Content: Balanced with flex-1 */}
              <View className={`flex-1 p-5 rounded-[24px] border ${item.status === 'Completed' ? 'bg-green-50/30 border-green-100' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-2">
                    <Text 
                      className={`text-lg font-bold dark:text-white ${item.status === 'Completed' ? 'line-through text-slate-400' : ''}`}
                      numberOfLines={2}
                    >
                      {item.activity}
                    </Text>
                    <View className="flex-row mt-2">
                      <View className={`px-2 py-0.5 rounded-md border ${
                        item.status === 'Completed' ? 'bg-green-100 border-green-200' : 
                        item.status === 'In Progress' ? 'bg-amber-100 border-amber-200' : 'bg-slate-100 border-slate-200'
                      }`}>
                         <Text className={`text-[9px] font-black uppercase ${
                           item.status === 'Completed' ? 'text-green-700' : 
                           item.status === 'In Progress' ? 'text-amber-700' : 'text-slate-600'
                         }`}>{item.status}</Text>
                      </View>
                    </View>
                  </View>

                  {canEdit && (
                    <TouchableOpacity 
                      onPress={() => cycleStatus(item.id, item.activity, item.status)}
                      className="bg-white dark:bg-slate-700 w-10 h-10 rounded-full items-center justify-center shadow-sm border border-slate-200 dark:border-slate-600"
                    >
                      <Ionicons 
                        name={item.status === 'Completed' ? "refresh" : "checkmark-circle"} 
                        size={20} 
                        color={item.status === 'Completed' ? "#64748b" : "#22c55e"} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <Text className="text-slate-500 text-sm leading-5">{item.description}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center justify-center mt-20">
            <Ionicons name="search-outline" size={48} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4 text-lg">No activities found</Text>
          </View>
        )}
      </ScrollView>

      {/* Toast Notification */}
      {toastVisible && (
        <Animated.View 
          style={{ opacity: fadeAnim }}
          className="absolute bottom-10 left-6 right-6 bg-slate-900 dark:bg-indigo-600 p-5 rounded-[24px] flex-row items-center shadow-2xl"
        >
          <Ionicons name="notifications" size={20} color="white" />
          <Text className="text-white font-bold ml-3 flex-1">{toastMsg}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}