/**
 * @fileoverview VoiceService — Expo-compatible TTS using expo-speech.
 */
import * as Speech from 'expo-speech';

let _instance = null;

class VoiceService {
  constructor() {
    if (_instance) return _instance;
    this._rate = 0.8;
    this._pitch = 1.0;
    this._language = 'en-US';
    this._isInitialized = false;
    _instance = this;
  }

  static getInstance() {
    if (!_instance) _instance = new VoiceService();
    return _instance;
  }

  async initialize() {
    this._isInitialized = true;
    console.log('[VoiceService] Initialized with expo-speech.');
  }

  async speak(message) {
    if (!message) return;
    try {
      Speech.stop();
      Speech.speak(message, {
        rate: this._rate,
        pitch: this._pitch,
        language: this._language,
      });
    } catch (err) {
      console.error('[VoiceService] Error:', err);
    }
  }

  stop() {
    Speech.stop();
  }

  async confirmMedicationLogged(name) {
    await this.speak(`${name} has been logged successfully.`);
  }

  async confirmSOSTriggered() {
    await this.speak('Emergency alert triggered. Help is on the way. Stay calm.');
  }

  async confirmSOSCancelled() {
    await this.speak('Emergency alert has been cancelled.');
  }

  async remindMedication(name) {
    await this.speak(`Reminder: It is time to take your ${name}.`);
  }

  setRate(rate) { this._rate = rate; }
  setPitch(pitch) { this._pitch = pitch; }

  static reset() {
    Speech.stop();
    _instance = null;
  }
}

export default VoiceService;
