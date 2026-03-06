/**
 * @fileoverview Zustand store for emergency / SOS state with events log and relationships.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_KEY = '@carevoice_contacts';
const EVENTS_KEY = '@carevoice_emergency_events';

const useEmergencyStore = create((set, get) => ({
  isSOSActive: false,
  lastEvent: null,
  contacts: [],
  recentEvents: [],

  triggerSOS: () => {
    const event = {
      id: `sos_${Date.now()}`,
      timestamp: Date.now(),
      type: 'sos_triggered',
      resolved: false,
    };
    const events = [event, ...get().recentEvents].slice(0, 20);
    set({ isSOSActive: true, lastEvent: event, recentEvents: events });
    AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },

  cancelSOS: () => {
    const events = get().recentEvents.map((e, i) =>
      i === 0 && !e.resolved ? { ...e, resolved: true, resolvedAt: Date.now() } : e
    );
    set({ isSOSActive: false, recentEvents: events });
    AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },

  setLastEvent: (event) => set({ lastEvent: event, isSOSActive: false }),

  loadContacts: async () => {
    try {
      const raw = await AsyncStorage.getItem(CONTACTS_KEY);
      if (raw) set({ contacts: JSON.parse(raw) });
      const eventsRaw = await AsyncStorage.getItem(EVENTS_KEY);
      if (eventsRaw) set({ recentEvents: JSON.parse(eventsRaw) });
    } catch (e) {
      console.error('[EmergencyStore] Load error:', e);
    }
  },

  addContact: async ({ name, phone, relationship = '', isPrimary = false }) => {
    const contacts = [...get().contacts, {
      id: `c_${Date.now()}`,
      name,
      phone,
      relationship,
      isPrimary,
      createdAt: Date.now(),
    }];
    set({ contacts });
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  },

  updateContact: async (id, updates) => {
    const contacts = get().contacts.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    set({ contacts });
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  },

  removeContact: async (id) => {
    const contacts = get().contacts.filter(c => c.id !== id);
    set({ contacts });
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  },

  setPrimaryContact: async (id) => {
    const contacts = get().contacts.map(c => ({
      ...c,
      isPrimary: c.id === id,
    }));
    set({ contacts });
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  },

  setContacts: async (contacts) => {
    set({ contacts });
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  },

  clearEvents: async () => {
    set({ recentEvents: [] });
    await AsyncStorage.removeItem(EVENTS_KEY);
  },
}));

export default useEmergencyStore;
