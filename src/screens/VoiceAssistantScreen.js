/**
 * @fileoverview VoiceAssistantScreen — Interactive chat interface with medication context.
 */
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useMedicationStore from '../store/useMedicationStore';
import useEmergencyStore from '../store/useEmergencyStore';
import VoiceService from '../services/VoiceService';
import HapticService from '../services/HapticService';

function formatTime(timestamp) {
  if (!timestamp) return '--:--';
  const d = new Date(timestamp);
  let hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${mins} ${ampm}`;
}

const HELP_TEXT = `🎤 Available Commands:

• "help" — Show this help message
• "medications" / "meds" — List your medications
• "next" / "upcoming" — Show next medication
• "contacts" — List emergency contacts
• "emergency" / "sos" — Trigger emergency alert
• "cancel" — Cancel active SOS
• "status" — Show today's summary
• "hello" / "hi" — Get a greeting

Just type your question naturally!`;

function processCommand(input, meds, contacts, triggerSOS, cancelSOS, isSOSActive) {
  const cmd = input.toLowerCase().trim();

  if (cmd === 'help' || cmd === '?') {
    return { text: HELP_TEXT, type: 'info' };
  }

  if (cmd === 'hello' || cmd === 'hi' || cmd === 'hey') {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return { text: `${greeting}! 👋 I'm your CareVoice assistant. How can I help you today?\n\nType "help" to see what I can do.`, type: 'success' };
  }

  if (cmd.includes('medication') || cmd.includes('meds') || cmd === 'list') {
    if (meds.length === 0) return { text: 'You have no medications added yet. Go to the Medications tab to add some.', type: 'info' };
    const active = meds.filter(m => m.isActive !== false);
    const list = active.map(m => `  💊 ${m.name} (${m.dosage}) — ${m.status} at ${formatTime(m.scheduledTime)}`).join('\n');
    return { text: `📋 Your ${active.length} active medication(s):\n\n${list}`, type: 'info' };
  }

  if (cmd.includes('next') || cmd.includes('upcoming') || cmd.includes('when')) {
    const pending = meds.filter(m => m.status === 'pending' && m.isActive !== false).sort((a, b) => a.scheduledTime - b.scheduledTime);
    if (pending.length === 0) return { text: '✅ No pending medications! You\'re all caught up.', type: 'success' };
    const next = pending[0];
    return { text: `⏰ Your next medication:\n\n💊 ${next.name} (${next.dosage})\n🕐 Scheduled: ${formatTime(next.scheduledTime)}\n📅 Frequency: ${next.frequency || 'daily'}`, type: 'info' };
  }

  if (cmd.includes('contact')) {
    if (contacts.length === 0) return { text: 'No emergency contacts added yet. Go to Settings to add contacts.', type: 'info' };
    const list = contacts.map(c => `  ${c.isPrimary ? '⭐' : '👤'} ${c.name} — ${c.phone}${c.relationship ? ` (${c.relationship})` : ''}`).join('\n');
    return { text: `📞 Emergency contacts (${contacts.length}):\n\n${list}`, type: 'info' };
  }

  if (cmd.includes('emergency') || cmd.includes('sos') || cmd.includes('help me')) {
    if (isSOSActive) return { text: '🚨 SOS is already active! Type "cancel" to cancel.', type: 'warning' };
    triggerSOS();
    return { text: '🚨 EMERGENCY ALERT TRIGGERED!\n\nYour emergency contacts are being notified. Stay calm. Help is on the way.\n\nType "cancel" to cancel the alert.', type: 'error' };
  }

  if (cmd === 'cancel') {
    if (!isSOSActive) return { text: 'No active emergency alert to cancel.', type: 'info' };
    cancelSOS();
    return { text: '✅ Emergency alert cancelled. You\'re safe now.', type: 'success' };
  }

  if (cmd.includes('status') || cmd.includes('summary') || cmd.includes('today')) {
    const active = meds.filter(m => m.isActive !== false);
    const taken = meds.filter(m => m.status === 'taken').length;
    const pending = meds.filter(m => m.status === 'pending' && m.isActive !== false).length;
    return {
      text: `📊 Today's Summary:\n\n💊 Active medications: ${active.length}\n✅ Taken: ${taken}\n⏳ Pending: ${pending}\n👥 Emergency contacts: ${contacts.length}\n🚨 SOS: ${isSOSActive ? 'ACTIVE' : 'Inactive'}`,
      type: 'info',
    };
  }

  return { text: `🤔 I didn't quite understand "${input}".\n\nTry one of these:\n• "medications" — see your meds\n• "next" — upcoming medication\n• "help" — all commands`, type: 'info' };
}

function ChatBubble({ message, isUser }) {
  const bgColor = isUser
    ? 'bg-accent-500'
    : message.type === 'error'
      ? 'bg-primary-500/20 border border-primary-500/30'
      : message.type === 'warning'
        ? 'bg-warning-500/20 border border-warning-500/30'
        : message.type === 'success'
          ? 'bg-success-500/15 border border-success-500/30'
          : 'bg-surface-700/60 border border-surface-700';

  return (
    <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      <View className={`${bgColor} rounded-2xl px-4 py-3 max-w-[90%]`}>
        <Text className={`text-base leading-6 ${isUser ? 'text-white' : 'text-surface-50'}`}>
          {message.text}
        </Text>
      </View>
      <Text className="text-surface-200/40 text-xs mt-1 px-1">
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

export default function VoiceAssistantScreen() {
  const [messages, setMessages] = useState([
    { id: '0', text: '👋 Hello! I\'m your CareVoice Assistant.\n\nI can help you check medications, manage emergencies, and more.\n\nType "help" to see all commands.', type: 'success', isUser: false, timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const medications = useMedicationStore(s => s.medications);
  const { contacts, triggerSOS, cancelSOS, isSOSActive } = useEmergencyStore();

  const handleSend = () => {
    if (!input.trim()) return;
    HapticService.light();

    const userMsg = { id: `u_${Date.now()}`, text: input.trim(), isUser: true, timestamp: Date.now() };
    const response = processCommand(input, medications, contacts, triggerSOS, cancelSOS, isSOSActive);
    const botMsg = { id: `b_${Date.now()}`, ...response, isUser: false, timestamp: Date.now() + 1 };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');

    // Speak the response
    if (response.text.length < 200) {
      VoiceService.getInstance().speak(response.text.replace(/[^\w\s.,!?'-]/g, ''));
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-900">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {/* Header */}
        <View className="px-5 pt-4 pb-3 border-b border-surface-700">
          <Text className="text-white text-heading font-bold">Voice Assistant 🎤</Text>
          <Text className="text-surface-200 text-sm">Ask me anything about your care</Text>
        </View>

        {/* Chat */}
        <ScrollView ref={scrollRef} className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 10 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {messages.map(m => <ChatBubble key={m.id} message={m} isUser={m.isUser} />)}
        </ScrollView>

        {/* Input */}
        <View className="px-5 py-3 border-t border-surface-700 bg-surface-900">
          <View className="flex-row gap-3">
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              placeholder='Type a command... (try "help")'
              placeholderTextColor="#475569"
              returnKeyType="send"
              className="flex-1 bg-surface-700/60 text-white text-lg rounded-2xl px-5 py-3 border border-surface-700"
              style={{ minHeight: 48 }}
            />
            <TouchableOpacity onPress={handleSend} activeOpacity={0.7}
              className="bg-accent-500 rounded-2xl px-5 items-center justify-center" style={{ minHeight: 48, minWidth: 48 }}>
              <Text className="text-white text-xl font-bold">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
