/**
 * @fileoverview Zustand store for medication state — full CRUD.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@carevoice_medications';

const useMedicationStore = create((set, get) => ({
  medications: [],
  isLoaded: false,

  loadMedications: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ medications: JSON.parse(raw), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      console.error('[MedicationStore] Load error:', e);
      set({ isLoaded: true });
    }
  },

  _persist: async () => {
    const { medications } = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
  },

  setMedications: async (medications) => {
    set({ medications });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
  },

  addMedication: async ({ name, dosage, scheduledTime, frequency = 'daily' }) => {
    const med = {
      id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      dosage,
      scheduledTime,
      frequency,
      status: 'pending',
      takenTime: null,
      isActive: true,
      createdAt: Date.now(),
    };
    const meds = [...get().medications, med];
    set({ medications: meds });
    await get()._persist();
    return med;
  },

  updateMedication: async (id, updates) => {
    const meds = get().medications.map(m =>
      m.id === id ? { ...m, ...updates } : m
    );
    set({ medications: meds });
    await get()._persist();
  },

  removeMedication: async (id) => {
    const meds = get().medications.filter(m => m.id !== id);
    set({ medications: meds });
    await get()._persist();
  },

  markAsTaken: async (id) => {
    const meds = get().medications.map(m =>
      m.id === id ? { ...m, status: 'taken', takenTime: Date.now() } : m
    );
    set({ medications: meds });
    await get()._persist();
  },

  markAsSkipped: async (id) => {
    const meds = get().medications.map(m =>
      m.id === id ? { ...m, status: 'skipped' } : m
    );
    set({ medications: meds });
    await get()._persist();
  },

  toggleActive: async (id) => {
    const meds = get().medications.map(m =>
      m.id === id ? { ...m, isActive: !m.isActive } : m
    );
    set({ medications: meds });
    await get()._persist();
  },

  getActiveMedications: () => get().medications.filter(m => m.isActive !== false),
  getPendingMedications: () => get().medications.filter(m => m.status === 'pending' && m.isActive !== false),
}));

export default useMedicationStore;
