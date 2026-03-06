import './global.css';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import VoiceService from './src/services/VoiceService';
import FallDetectionService from './src/services/FallDetectionService';
import useMedicationStore from './src/store/useMedicationStore';
import useEmergencyStore from './src/store/useEmergencyStore';
import useSettingsStore from './src/store/useSettingsStore';
import useFeedbackStore from './src/store/useFeedbackStore';

async function seedDemoData() {
  try {
    const hasSeeded = await AsyncStorage.getItem('@carevoice_seeded');
    if (hasSeeded === 'true') return;

    const now = Date.now();
    const hour = 60 * 60 * 1000;

    await useMedicationStore.getState().setMedications([
      { id: 'med_1', name: 'Metformin', dosage: '500mg', scheduledTime: now - 2 * hour, frequency: 'daily', status: 'taken', takenTime: now - 1.5 * hour, isActive: true, createdAt: now },
      { id: 'med_2', name: 'Lisinopril', dosage: '10mg', scheduledTime: now + 1 * hour, frequency: 'daily', status: 'pending', takenTime: null, isActive: true, createdAt: now },
      { id: 'med_3', name: 'Amlodipine', dosage: '5mg', scheduledTime: now + 4 * hour, frequency: 'daily', status: 'pending', takenTime: null, isActive: true, createdAt: now },
      { id: 'med_4', name: 'Atorvastatin', dosage: '20mg', scheduledTime: now + 8 * hour, frequency: 'weekly', status: 'pending', takenTime: null, isActive: true, createdAt: now },
    ]);

    await useEmergencyStore.getState().setContacts([
      { id: 'c_1', name: 'Dr. Sharma', phone: '+919876543210', relationship: 'Doctor', isPrimary: true, createdAt: now },
      { id: 'c_2', name: 'Rahul', phone: '+919876543211', relationship: 'Son', isPrimary: false, createdAt: now },
      { id: 'c_3', name: 'Priya', phone: '+919876543212', relationship: 'Daughter', isPrimary: false, createdAt: now },
    ]);

    await AsyncStorage.setItem('@carevoice_seeded', 'true');
  } catch (e) {
    console.error('[App] Seed error:', e);
  }
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await useMedicationStore.getState().loadMedications();
        await useEmergencyStore.getState().loadContacts();
        await useSettingsStore.getState().loadSettings();
        await useFeedbackStore.getState().loadFeedback();
        await seedDemoData();
        await useMedicationStore.getState().loadMedications();
        await useEmergencyStore.getState().loadContacts();
        await VoiceService.getInstance().initialize();
        await FallDetectionService.getInstance().startMonitoring();
      } catch (e) {
        console.error('[App] Init error:', e);
      } finally {
        setIsReady(true);
      }
    };
    init();
    return () => {
      VoiceService.getInstance().stop();
      FallDetectionService.getInstance().stopMonitoring();
    };
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#22d3ee" />
        <Text style={{ color: '#e2e8f0', fontSize: 18, marginTop: 16 }}>Loading CareVoice...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
