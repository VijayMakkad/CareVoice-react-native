import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import MedicationScreen from '../screens/MedicationScreen';
import VoiceAssistantScreen from '../screens/VoiceAssistantScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ label, emoji, focused }) => (
  <View className={`items-center justify-center py-1 ${focused ? 'opacity-100' : 'opacity-50'}`}>
    <Text className="text-2xl mb-0.5">{emoji}</Text>
    <Text className={`text-xs font-semibold ${focused ? 'text-accent-400' : 'text-surface-200'}`}>{label}</Text>
  </View>
);

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#0f172a',
        borderTopColor: '#1e293b',
        borderTopWidth: 1,
        height: 88,
        paddingBottom: 20,
        paddingTop: 8,
      },
      tabBarShowLabel: false,
    }}>
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }} />
      <Tab.Screen name="Medications" component={MedicationScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💊" label="Meds" focused={focused} /> }} />
      <Tab.Screen name="Voice" component={VoiceAssistantScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎤" label="Voice" focused={focused} /> }} />
      <Tab.Screen name="Emergency" component={EmergencyScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🚨" label="SOS" focused={focused} /> }} />
      <Tab.Screen name="Settings" component={SettingsStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="Settings" focused={focused} /> }} />
    </Tab.Navigator>
  );
}
