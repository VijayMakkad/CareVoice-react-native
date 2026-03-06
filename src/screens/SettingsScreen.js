import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSettingsStore from '../store/useSettingsStore';
import useEmergencyStore from '../store/useEmergencyStore';
import HapticService from '../services/HapticService';
import VoiceService from '../services/VoiceService';

function SettingRow({ emoji, label, description, children }) {
  return (
    <View className="bg-surface-700/40 rounded-2xl p-4 mb-3 border border-surface-700">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-4">
          <Text className="text-2xl mr-3">{emoji}</Text>
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold">{label}</Text>
            {description && <Text className="text-surface-200 text-sm mt-0.5">{description}</Text>}
          </View>
        </View>
        {children}
      </View>
    </View>
  );
}

function AddContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [expanded, setExpanded] = useState(false);
  const addContact = useEmergencyStore(s => s.addContact);

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing Info', 'Please enter name and phone number.');
      return;
    }
    HapticService.success();
    await addContact({ name: name.trim(), phone: phone.trim(), relationship: relationship.trim(), isPrimary: false });
    VoiceService.getInstance().speak(`${name} added as emergency contact.`);
    setName(''); setPhone(''); setRelationship(''); setExpanded(false);
  };

  if (!expanded) {
    return (
      <TouchableOpacity onPress={() => { setExpanded(true); HapticService.light(); }}
        className="bg-accent-500/15 rounded-2xl p-4 items-center border border-accent-500/30 border-dashed">
        <Text className="text-accent-400 text-lg font-bold">+ Add Emergency Contact</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-surface-700/40 rounded-2xl p-5 border border-accent-500/30">
      <Text className="text-white text-lg font-bold mb-3">New Contact</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#475569"
        className="bg-surface-800 text-white text-lg rounded-xl px-4 py-3 mb-3 border border-surface-700" style={{ minHeight: 48 }} />
      <TextInput value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#475569" keyboardType="phone-pad"
        className="bg-surface-800 text-white text-lg rounded-xl px-4 py-3 mb-3 border border-surface-700" style={{ minHeight: 48 }} />
      <TextInput value={relationship} onChangeText={setRelationship} placeholder="Relationship (e.g. Son, Doctor)" placeholderTextColor="#475569"
        className="bg-surface-800 text-white text-lg rounded-xl px-4 py-3 mb-4 border border-surface-700" style={{ minHeight: 48 }} />
      <View className="flex-row gap-3">
        <TouchableOpacity onPress={handleAdd} className="flex-1 bg-accent-500 rounded-xl py-3 items-center" style={{ minHeight: 48 }}>
          <Text className="text-white text-lg font-bold">Save</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setExpanded(false)} className="bg-surface-700 rounded-xl px-5 py-3 items-center justify-center" style={{ minHeight: 48 }}>
          <Text className="text-surface-200 text-lg">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ContactList() {
  const contacts = useEmergencyStore(s => s.contacts);
  const removeContact = useEmergencyStore(s => s.removeContact);

  return contacts.map((c, i) => (
    <View key={c.id || i} className="bg-surface-700/40 rounded-2xl p-4 mb-3 flex-row items-center border border-surface-700">
      <View className="w-10 h-10 rounded-full bg-accent-500/20 items-center justify-center mr-3">
        <Text className="text-xl">{c.isPrimary ? '⭐' : '👤'}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-white text-lg font-bold">{c.name}</Text>
        <Text className="text-surface-200 text-sm">{c.phone}</Text>
        {c.relationship ? <Text className="text-accent-400/60 text-xs mt-0.5">{c.relationship}</Text> : null}
      </View>
      <TouchableOpacity onPress={() => Alert.alert('Remove?', `Remove ${c.name}?`, [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => removeContact(c.id) },
      ])} className="bg-primary-500/20 rounded-xl px-3 py-2">
        <Text className="text-primary-400 text-base">🗑️</Text>
      </TouchableOpacity>
    </View>
  ));
}

export default function SettingsScreen({ navigation }) {
  const { voiceEnabled, hapticEnabled, notificationsEnabled, fallDetectionEnabled, updateSetting } = useSettingsStore();
  const tc = { false: '#1e293b', true: '#0891b2' };

  return (
    <SafeAreaView className="flex-1 bg-surface-900">
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="pt-4 pb-6">
          <Text className="text-white text-heading-lg">Settings ⚙️</Text>
        </View>

        <Text className="text-surface-200 text-label uppercase tracking-wider mb-3">Features</Text>
        <SettingRow emoji="🔊" label="Voice Feedback" description="Speak confirmations aloud">
          <Switch value={voiceEnabled} onValueChange={v => updateSetting('voiceEnabled', v)} trackColor={tc} thumbColor={voiceEnabled ? '#22d3ee' : '#64748b'} />
        </SettingRow>
        <SettingRow emoji="📳" label="Haptic Feedback" description="Vibrate on actions">
          <Switch value={hapticEnabled} onValueChange={v => updateSetting('hapticEnabled', v)} trackColor={tc} thumbColor={hapticEnabled ? '#22d3ee' : '#64748b'} />
        </SettingRow>
        <SettingRow emoji="🔔" label="Notifications" description="Medication reminders">
          <Switch value={notificationsEnabled} onValueChange={v => updateSetting('notificationsEnabled', v)} trackColor={tc} thumbColor={notificationsEnabled ? '#22d3ee' : '#64748b'} />
        </SettingRow>
        <SettingRow emoji="🛡️" label="Fall Detection" description="Monitor for falls">
          <Switch value={fallDetectionEnabled} onValueChange={v => updateSetting('fallDetectionEnabled', v)} trackColor={tc} thumbColor={fallDetectionEnabled ? '#22d3ee' : '#64748b'} />
        </SettingRow>

        <Text className="text-surface-200 text-label uppercase tracking-wider mb-3 mt-5">Emergency Contacts</Text>
        <ContactList />
        <View className="mt-2 mb-4"><AddContactForm /></View>

        <Text className="text-surface-200 text-label uppercase tracking-wider mb-3 mt-2">Feedback</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Feedback')}
          className="bg-surface-700/40 rounded-2xl p-4 border border-surface-700 flex-row items-center">
          <Text className="text-2xl mr-3">📝</Text>
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold">Rate & Review</Text>
            <Text className="text-surface-200 text-sm">Share your experience</Text>
          </View>
          <Text className="text-surface-200 text-xl">→</Text>
        </TouchableOpacity>

        <Text className="text-surface-200 text-label uppercase tracking-wider mb-3 mt-5">About</Text>
        <View className="bg-surface-700/40 rounded-2xl p-5 border border-surface-700 items-center">
          <Text className="text-3xl mb-2">❤️</Text>
          <Text className="text-white text-xl font-bold">CareVoice</Text>
          <Text className="text-surface-200 text-sm mt-1">Version 2.0 — Expo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
