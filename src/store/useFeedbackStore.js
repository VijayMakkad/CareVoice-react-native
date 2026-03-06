/**
 * @fileoverview Zustand store for feedback & reviews.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FEEDBACK_KEY = '@carevoice_feedback';

const useFeedbackStore = create((set, get) => ({
  submissions: [],
  isLoaded: false,

  loadFeedback: async () => {
    try {
      const raw = await AsyncStorage.getItem(FEEDBACK_KEY);
      if (raw) set({ submissions: JSON.parse(raw), isLoaded: true });
      else set({ isLoaded: true });
    } catch (e) {
      console.error('[FeedbackStore] Load error:', e);
      set({ isLoaded: true });
    }
  },

  submitFeedback: async ({ appRating, serviceRating, comments, contactInfo }) => {
    const feedback = {
      id: `fb_${Date.now()}`,
      appRating,
      serviceRating,
      comments,
      contactInfo,
      timestamp: Date.now(),
    };
    const submissions = [feedback, ...get().submissions];
    set({ submissions });
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(submissions));
    return feedback;
  },
}));

export default useFeedbackStore;
