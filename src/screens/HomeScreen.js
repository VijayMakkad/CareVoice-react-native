/**
 * @fileoverview HomeScreen — Dashboard with greeting, next med, active count, quick SOS.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useMedicationStore from '../store/useMedicationStore';
import useEmergencyStore from '../store/useEmergencyStore';
import HapticService from '../services/HapticService';
import VoiceService from '../services/VoiceService';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning ☀️';
  if (hour < 17) return 'Good Afternoon 🌤';
  return 'Good Evening 🌙';
}

function formatTime(timestamp) {
  if (!timestamp) return '--:--';
  const d = new Date(timestamp);
  let hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${mins} ${ampm}`;
}

function SOSButton() {
  const { triggerSOS, isSOSActive, cancelSOS } = useEmergencyStore();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = async () => {
    if (isSOSActive) {
      cancelSOS();
      HapticService.success();
      VoiceService.getInstance().confirmSOSCancelled();
    } else {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      HapticService.heavy();
      triggerSOS();
      VoiceService.getInstance().confirmSOSTriggered();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8} className="items-center justify-center">
        <LinearGradient
          colors={isSOSActive ? ['#22c55e', '#16a34a'] : ['#f93d3d', '#c21414']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-40 h-40 rounded-full items-center justify-center"
          style={{ shadowColor: isSOSActive ? '#22c55e' : '#f93d3d', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12 }}
        >
          <Text className="text-5xl mb-1">{isSOSActive ? '✓' : '🆘'}</Text>
          <Text className="text-white text-xl font-bold">{isSOSActive ? 'CANCEL' : 'SOS'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function NextMedicationCard() {
  const medications = useMedicationStore(s => s.medications);
  const pending = medications.filter(m => m.status === 'pending' && m.isActive !== false);
  const next = pending.sort((a, b) => a.scheduledTime - b.scheduledTime)[0];

  if (!next) {
    return (
      <View className="bg-surface-700/60 rounded-2xl p-5 border border-success-500/30">
        <View className="flex-row items-center mb-2">
          <Text className="text-2xl mr-2">✅</Text>
          <Text className="text-success-400 text-body font-bold">All Done for Today!</Text>
        </View>
        <Text className="text-surface-200 text-base">No pending medications. Great job!</Text>
      </View>
    );
  }

  return (
    <View className="bg-surface-700/60 rounded-2xl p-5 border border-accent-500/30">
      <Text className="text-label text-accent-400 uppercase tracking-wider mb-2">⏰ Next Medication</Text>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold">{next.name}</Text>
          <Text className="text-surface-200 text-body">{next.dosage}</Text>
          {next.frequency && (
            <Text className="text-accent-400/60 text-sm mt-1 capitalize">{next.frequency}</Text>
          )}
        </View>
        <View className="bg-accent-500/20 rounded-xl px-4 py-2">
          <Text className="text-accent-400 text-body-lg font-bold">{formatTime(next.scheduledTime)}</Text>
        </View>
      </View>
    </View>
  );
}

function QuickStatsRow() {
  const medications = useMedicationStore(s => s.medications);
  const contacts = useEmergencyStore(s => s.contacts);
  const activeMeds = medications.filter(m => m.isActive !== false);
  const taken = medications.filter(m => m.status === 'taken').length;
  const pending = medications.filter(m => m.status === 'pending' && m.isActive !== false).length;

  const stats = [
    { label: 'Active Meds', value: activeMeds.length.toString(), emoji: '💊', color: 'text-accent-400' },
    { label: 'Taken', value: taken.toString(), emoji: '✅', color: 'text-success-400' },
    { label: 'Pending', value: pending.toString(), emoji: '⏳', color: 'text-warning-400' },
    { label: 'Contacts', value: contacts.length.toString(), emoji: '👥', color: 'text-primary-400' },
  ];

  return (
    <View className="flex-row flex-wrap gap-3">
      {stats.map((s, i) => (
        <View key={i} className="flex-1 min-w-[45%] bg-surface-700/40 rounded-2xl p-4 items-center border border-surface-700">
          <Text className="text-2xl mb-1">{s.emoji}</Text>
          <Text className={`${s.color} text-2xl font-bold`}>{s.value}</Text>
          <Text className="text-surface-200 text-xs mt-1">{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface-900">
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="pt-4 pb-6">
          <Text className="text-surface-200 text-body">Welcome back 👋</Text>
          <Text className="text-white text-heading-lg">{getGreeting()}</Text>
        </View>
        <View className="items-center py-4">
          <SOSButton />
          <Text className="text-surface-200 text-sm mt-4">Press for Emergency Help</Text>
        </View>
        <View className="mb-4">
          <NextMedicationCard />
        </View>
        <View className="mb-4">
          <Text className="text-surface-200 text-label uppercase tracking-wider mb-3">Today's Summary</Text>
          <QuickStatsRow />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
