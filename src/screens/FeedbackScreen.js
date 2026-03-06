import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useFeedbackStore from '../store/useFeedbackStore';
import HapticService from '../services/HapticService';
import VoiceService from '../services/VoiceService';

function StarRating({ value, onChange, label }) {
  return (
    <View className="mb-5">
      <Text className="text-surface-200 text-sm font-semibold mb-2 uppercase tracking-wider">{label}</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => { onChange(star); HapticService.selection(); }}
            className={`w-14 h-14 rounded-2xl items-center justify-center ${star <= value ? 'bg-warning-400' : 'bg-surface-700/60'}`}
            style={{ minHeight: 48, minWidth: 48 }}>
            <Text className="text-2xl">{star <= value ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function FeedbackScreen({ navigation }) {
  const [appRating, setAppRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [comments, setComments] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submitFeedback = useFeedbackStore(s => s.submitFeedback);

  const handleSubmit = async () => {
    if (appRating === 0) {
      Alert.alert('Rating Required', 'Please rate your app experience.');
      return;
    }
    HapticService.success();
    await submitFeedback({ appRating, serviceRating, comments: comments.trim(), contactInfo: contactInfo.trim() });
    VoiceService.getInstance().speak('Thank you for your feedback!');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-surface-900">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-6xl mb-4">🎉</Text>
          <Text className="text-white text-heading text-center font-bold">Thank You!</Text>
          <Text className="text-surface-200 text-body text-center mt-3">
            Your feedback has been submitted and securely stored.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}
            className="bg-accent-500 rounded-2xl px-8 py-4 mt-8" style={{ minHeight: 48 }}>
            <Text className="text-white text-lg font-bold">Back to Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-900">
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="pt-4 pb-2 flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 bg-surface-700/40 rounded-xl px-3 py-2">
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-heading-lg">Feedback 📝</Text>
        </View>
        <Text className="text-surface-200 text-body mb-6">We value your feedback. Help us improve CareVoice.</Text>

        <StarRating value={appRating} onChange={setAppRating} label="App Experience" />
        <StarRating value={serviceRating} onChange={setServiceRating} label="Service Quality" />

        <Text className="text-surface-200 text-sm font-semibold mb-2 uppercase tracking-wider">Comments</Text>
        <TextInput value={comments} onChangeText={setComments} placeholder="Share your thoughts..." placeholderTextColor="#475569"
          multiline numberOfLines={4} textAlignVertical="top"
          className="bg-surface-700/40 text-white text-lg rounded-2xl px-4 py-4 mb-5 border border-surface-700"
          style={{ minHeight: 120 }} />

        <Text className="text-surface-200 text-sm font-semibold mb-2 uppercase tracking-wider">Contact Info (Optional)</Text>
        <TextInput value={contactInfo} onChangeText={setContactInfo} placeholder="Email or phone for follow-up" placeholderTextColor="#475569"
          className="bg-surface-700/40 text-white text-lg rounded-2xl px-4 py-3 mb-6 border border-surface-700" style={{ minHeight: 48 }} />

        <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}
          className="bg-accent-500 rounded-2xl py-4 items-center" style={{ minHeight: 52 }}>
          <Text className="text-white text-xl font-bold">Submit Feedback</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
