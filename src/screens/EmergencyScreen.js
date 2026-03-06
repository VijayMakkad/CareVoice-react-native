/**
 * @fileoverview EmergencyScreen — SOS, contacts with relationships, recent events log.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useEmergencyStore from '../store/useEmergencyStore';
import FallDetectionService from '../services/FallDetectionService';
import HapticService from '../services/HapticService';
import VoiceService from '../services/VoiceService';

function formatTimestamp(ts) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return isToday ? `Today ${time}` : `${d.toLocaleDateString()} ${time}`;
}

function ContactCard({ contact }) {
  const setPrimaryContact = useEmergencyStore(s => s.setPrimaryContact);

  const handleCall = () => {
    HapticService.medium();
    Linking.openURL(`tel:${contact.phone}`).catch(() =>
      Alert.alert('Error', 'Unable to make a phone call on this device.')
    );
  };

  const handleSMS = () => {
    HapticService.medium();
    Linking.openURL(`sms:${contact.phone}?body=EMERGENCY: I need help! This is an SOS from CareVoice.`).catch(() =>
      Alert.alert('Error', 'Unable to send SMS on this device.')
    );
  };

  return (
    <View className={`rounded-2xl p-4 mb-3 border ${contact.isPrimary ? 'bg-accent-500/15 border-accent-500/30' : 'bg-surface-700/40 border-surface-700'}`}>
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 rounded-full bg-accent-500/20 items-center justify-center mr-4">
          <Text className="text-2xl">{contact.isPrimary ? '⭐' : '👤'}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">{contact.name}</Text>
          <Text className="text-surface-200 text-sm">{contact.phone}</Text>
          {contact.relationship ? (
            <Text className="text-accent-400/70 text-xs mt-0.5">{contact.relationship}</Text>
          ) : null}
          {contact.isPrimary && (
            <Text className="text-accent-400 text-xs font-bold mt-0.5">PRIMARY CONTACT</Text>
          )}
        </View>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity onPress={handleCall} activeOpacity={0.7}
          className="flex-1 bg-success-500 rounded-xl py-2.5 items-center flex-row justify-center" style={{ minHeight: 44 }}>
          <Text className="text-white text-base font-bold">📞 Call</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSMS} activeOpacity={0.7}
          className="flex-1 bg-accent-600 rounded-xl py-2.5 items-center flex-row justify-center" style={{ minHeight: 44 }}>
          <Text className="text-white text-base font-bold">💬 SMS</Text>
        </TouchableOpacity>
        {!contact.isPrimary && (
          <TouchableOpacity onPress={() => { HapticService.selection(); setPrimaryContact(contact.id); }} activeOpacity={0.7}
            className="bg-surface-700 rounded-xl px-3 py-2.5 items-center justify-center" style={{ minHeight: 44 }}>
            <Text className="text-surface-200 text-xs">⭐</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function SOSSection() {
  const { isSOSActive, triggerSOS, cancelSOS } = useEmergencyStore();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSOSActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else { pulseAnim.setValue(1); }
  }, [isSOSActive]);

  const handlePress = () => {
    if (isSOSActive) {
      cancelSOS();
      HapticService.success();
      VoiceService.getInstance().confirmSOSCancelled();
    } else {
      HapticService.heavy();
      triggerSOS();
      VoiceService.getInstance().confirmSOSTriggered();
    }
  };

  return (
    <View className="items-center py-5">
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <LinearGradient colors={isSOSActive ? ['#22c55e', '#16a34a'] : ['#f93d3d', '#c21414']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            className="w-36 h-36 rounded-full items-center justify-center"
            style={{ shadowColor: isSOSActive ? '#22c55e' : '#f93d3d', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 }}>
            <Text className="text-4xl mb-1">{isSOSActive ? '✓' : '🆘'}</Text>
            <Text className="text-white text-lg font-bold">{isSOSActive ? 'CANCEL' : 'SOS'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      <Text className="text-surface-200 text-sm mt-3">
        {isSOSActive ? 'Help is on the way — tap to cancel' : 'One-tap emergency alert'}
      </Text>
    </View>
  );
}

function FallDetectionStatus() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  useEffect(() => { setIsMonitoring(FallDetectionService.getInstance().isMonitoring()); }, []);

  return (
    <View className={`rounded-2xl p-4 border ${isMonitoring ? 'bg-success-500/10 border-success-500/30' : 'bg-surface-700/40 border-surface-700'}`}>
      <View className="flex-row items-center">
        <Text className="text-2xl mr-3">{isMonitoring ? '🟢' : '🔴'}</Text>
        <View>
          <Text className="text-white text-lg font-bold">Fall Detection</Text>
          <Text className="text-surface-200 text-base">{isMonitoring ? 'Actively monitoring' : 'Not available / disabled'}</Text>
        </View>
      </View>
    </View>
  );
}

function RecentEventsLog() {
  const { recentEvents, clearEvents } = useEmergencyStore();
  if (recentEvents.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-surface-200 text-label uppercase tracking-wider">Recent Events</Text>
        <TouchableOpacity onPress={() => { Alert.alert('Clear History', 'Clear all event history?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: clearEvents },
        ]); }}>
          <Text className="text-primary-400 text-sm">Clear</Text>
        </TouchableOpacity>
      </View>
      {recentEvents.slice(0, 5).map(event => (
        <View key={event.id} className="bg-surface-700/30 rounded-xl p-3 mb-2 flex-row items-center border border-surface-700">
          <Text className="text-xl mr-3">{event.resolved ? '✅' : '🚨'}</Text>
          <View className="flex-1">
            <Text className="text-white text-sm font-semibold">
              SOS {event.resolved ? 'Resolved' : 'Triggered'}
            </Text>
            <Text className="text-surface-200/60 text-xs">{formatTimestamp(event.timestamp)}</Text>
          </View>
          {event.resolved && event.resolvedAt && (
            <Text className="text-success-400/60 text-xs">Resolved {formatTimestamp(event.resolvedAt)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

export default function EmergencyScreen() {
  const contacts = useEmergencyStore(s => s.contacts);

  return (
    <SafeAreaView className="flex-1 bg-surface-900">
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="pt-4 pb-2">
          <Text className="text-white text-heading-lg">Emergency 🚨</Text>
        </View>
        <SOSSection />
        <View className="mb-4">
          <FallDetectionStatus />
        </View>
        <RecentEventsLog />
        <View>
          <Text className="text-surface-200 text-label uppercase tracking-wider mb-3">Emergency Contacts</Text>
          {contacts.length > 0 ? (
            contacts.map((c, i) => <ContactCard key={c.id || i} contact={c} />)
          ) : (
            <View className="bg-surface-700/40 rounded-2xl p-5 items-center border border-surface-700">
              <Text className="text-3xl mb-2">👥</Text>
              <Text className="text-surface-200 text-body text-center">No emergency contacts.{'\n'}Add them in Settings.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
