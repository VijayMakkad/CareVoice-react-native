/**
 * @fileoverview MedicationScreen — Full CRUD: add, edit, remove, toggle, take/skip.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useMedicationStore from '../store/useMedicationStore';
import HapticService from '../services/HapticService';
import VoiceService from '../services/VoiceService';

function formatTime(timestamp) {
  if (!timestamp) return '--:--';
  const d = new Date(timestamp);
  let hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${mins} ${ampm}`;
}

const FREQUENCIES = ['daily', 'twice daily', 'weekly', 'monthly', 'as needed'];

const statusConfig = {
  taken: { emoji: '✅', label: 'Taken', bg: 'bg-success-500/15', border: 'border-success-500/30', text: 'text-success-400' },
  pending: { emoji: '⏳', label: 'Pending', bg: 'bg-warning-500/15', border: 'border-warning-500/30', text: 'text-warning-400' },
  skipped: { emoji: '⏭️', label: 'Skipped', bg: 'bg-surface-700/40', border: 'border-surface-700', text: 'text-surface-200' },
  missed: { emoji: '❌', label: 'Missed', bg: 'bg-primary-500/15', border: 'border-primary-500/30', text: 'text-primary-400' },
};

function AddMedicationForm({ onClose }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const addMedication = useMedicationStore(s => s.addMedication);

  const handleAdd = async () => {
    if (!name.trim() || !dosage.trim()) {
      Alert.alert('Missing Info', 'Please enter medication name and dosage.');
      return;
    }
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const now = new Date();
    now.setHours(h, m, 0, 0);
    let scheduledTime = now.getTime();
    if (scheduledTime < Date.now()) scheduledTime += 24 * 60 * 60 * 1000;

    HapticService.success();
    await addMedication({ name: name.trim(), dosage: dosage.trim(), scheduledTime, frequency });
    VoiceService.getInstance().speak(`${name} has been added to your medications.`);
    onClose();
  };

  return (
    <View className="bg-surface-800 rounded-3xl p-6 mx-4 border border-surface-700">
      <Text className="text-white text-2xl font-bold mb-5">Add Medication 💊</Text>

      <Text className="text-surface-200 text-sm font-semibold mb-1.5">MEDICATION NAME</Text>
      <TextInput value={name} onChangeText={setName} placeholder="e.g. Metformin" placeholderTextColor="#475569"
        className="bg-surface-900 text-white text-lg rounded-xl px-4 py-3 mb-4 border border-surface-700" style={{ minHeight: 48 }} />

      <Text className="text-surface-200 text-sm font-semibold mb-1.5">DOSAGE</Text>
      <TextInput value={dosage} onChangeText={setDosage} placeholder="e.g. 500mg" placeholderTextColor="#475569"
        className="bg-surface-900 text-white text-lg rounded-xl px-4 py-3 mb-4 border border-surface-700" style={{ minHeight: 48 }} />

      <Text className="text-surface-200 text-sm font-semibold mb-1.5">SCHEDULED TIME (HH:MM)</Text>
      <View className="flex-row gap-2 mb-4">
        <TextInput value={hours} onChangeText={setHours} placeholder="HH" placeholderTextColor="#475569"
          keyboardType="number-pad" maxLength={2}
          className="flex-1 bg-surface-900 text-white text-xl text-center rounded-xl px-4 py-3 border border-surface-700" style={{ minHeight: 48 }} />
        <Text className="text-white text-2xl self-center">:</Text>
        <TextInput value={minutes} onChangeText={setMinutes} placeholder="MM" placeholderTextColor="#475569"
          keyboardType="number-pad" maxLength={2}
          className="flex-1 bg-surface-900 text-white text-xl text-center rounded-xl px-4 py-3 border border-surface-700" style={{ minHeight: 48 }} />
      </View>

      <Text className="text-surface-200 text-sm font-semibold mb-2">FREQUENCY</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {FREQUENCIES.map(f => (
          <TouchableOpacity key={f} onPress={() => { setFrequency(f); HapticService.selection(); }}
            className={`rounded-xl px-4 py-2 ${frequency === f ? 'bg-accent-500' : 'bg-surface-700'}`} style={{ minHeight: 40 }}>
            <Text className={`text-sm font-semibold capitalize ${frequency === f ? 'text-white' : 'text-surface-200'}`}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity onPress={handleAdd} activeOpacity={0.8}
          className="flex-1 bg-accent-500 rounded-xl py-3.5 items-center" style={{ minHeight: 48 }}>
          <Text className="text-white text-lg font-bold">✓ Add Medication</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} activeOpacity={0.8}
          className="bg-surface-700 rounded-xl px-5 py-3.5 items-center justify-center" style={{ minHeight: 48 }}>
          <Text className="text-surface-200 text-lg">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MedicationCard({ med }) {
  const { markAsTaken, markAsSkipped, removeMedication, toggleActive } = useMedicationStore();
  const config = statusConfig[med.status] || statusConfig.pending;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const isInactive = med.isActive === false;

  const handleTake = async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    HapticService.success();
    await markAsTaken(med.id);
    VoiceService.getInstance().confirmMedicationLogged(med.name);
  };

  const handleRemove = () => {
    Alert.alert('Remove Medication', `Remove ${med.name} from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { HapticService.warning(); removeMedication(med.id); } },
    ]);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: isInactive ? 0.5 : 1 }}>
      <View className={`${config.bg} rounded-2xl p-5 mb-3 border ${config.border}`}>
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1">
            <Text className="text-3xl mr-3">{config.emoji}</Text>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">{med.name}</Text>
              <Text className="text-surface-200 text-base">{med.dosage}</Text>
              {med.frequency && <Text className="text-surface-200/60 text-xs capitalize mt-0.5">{med.frequency}</Text>}
            </View>
          </View>
          <View className="items-end">
            <Text className={`${config.text} text-lg font-semibold`}>{formatTime(med.scheduledTime)}</Text>
            <Text className={`${config.text} text-sm`}>{config.label}</Text>
          </View>
        </View>

        <View className="flex-row gap-2 mt-3">
          {med.status === 'pending' && !isInactive && (
            <>
              <TouchableOpacity onPress={handleTake} activeOpacity={0.8}
                className="flex-1 bg-success-500 rounded-xl py-2.5 items-center" style={{ minHeight: 44 }}>
                <Text className="text-white text-base font-bold">✓ Take Now</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { HapticService.light(); markAsSkipped(med.id); }} activeOpacity={0.8}
                className="bg-surface-700 rounded-xl px-4 py-2.5 items-center justify-center" style={{ minHeight: 44 }}>
                <Text className="text-surface-200 text-base">Skip</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={() => { HapticService.selection(); toggleActive(med.id); }}
            className="bg-surface-700/60 rounded-xl px-3 py-2.5 items-center justify-center" style={{ minHeight: 44 }}>
            <Text className="text-surface-200 text-xs">{isInactive ? '🔛' : '🔴'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRemove}
            className="bg-primary-500/20 rounded-xl px-3 py-2.5 items-center justify-center" style={{ minHeight: 44 }}>
            <Text className="text-primary-400 text-xs">🗑️</Text>
          </TouchableOpacity>
        </View>

        {med.status === 'taken' && med.takenTime && (
          <Text className="text-success-400/70 text-sm mt-2">Taken at {formatTime(med.takenTime)}</Text>
        )}
      </View>
    </Animated.View>
  );
}

export default function MedicationScreen() {
  const [showAdd, setShowAdd] = useState(false);
  const medications = useMedicationStore(s => s.medications);
  const active = medications.filter(m => m.isActive !== false);
  const pending = active.filter(m => m.status === 'pending');
  const completed = active.filter(m => m.status !== 'pending');
  const inactive = medications.filter(m => m.isActive === false);

  return (
    <SafeAreaView className="flex-1 bg-surface-900">
      <Modal visible={showAdd} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center">
          <AddMedicationForm onClose={() => setShowAdd(false)} />
        </View>
      </Modal>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-white text-heading-lg">Medications 💊</Text>
            <Text className="text-surface-200 text-body mt-1">
              {active.length} active • {pending.length} pending
            </Text>
          </View>
          <TouchableOpacity onPress={() => { setShowAdd(true); HapticService.light(); }}
            className="bg-accent-500 rounded-2xl px-5 py-3" style={{ minHeight: 48 }}>
            <Text className="text-white text-lg font-bold">+ Add</Text>
          </TouchableOpacity>
        </View>

        {pending.length > 0 && (
          <View className="mb-4 mt-3">
            <Text className="text-warning-400 text-label uppercase tracking-wider mb-3">⏳ Upcoming</Text>
            {pending.sort((a, b) => a.scheduledTime - b.scheduledTime).map(m => <MedicationCard key={m.id} med={m} />)}
          </View>
        )}

        {completed.length > 0 && (
          <View className="mb-4">
            <Text className="text-surface-200 text-label uppercase tracking-wider mb-3">Completed</Text>
            {completed.map(m => <MedicationCard key={m.id} med={m} />)}
          </View>
        )}

        {inactive.length > 0 && (
          <View className="mb-4">
            <Text className="text-surface-200/50 text-label uppercase tracking-wider mb-3">Inactive</Text>
            {inactive.map(m => <MedicationCard key={m.id} med={m} />)}
          </View>
        )}

        {medications.length === 0 && (
          <View className="items-center py-20">
            <Text className="text-6xl mb-4">💊</Text>
            <Text className="text-surface-200 text-body text-center">No medications yet.{'\n'}Tap "+ Add" to get started.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
