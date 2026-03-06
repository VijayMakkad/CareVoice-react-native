/**
 * @fileoverview FallDetectionService — Uses expo-sensors Accelerometer.
 */
import { Accelerometer } from 'expo-sensors';

let _instance = null;

class FallDetectionService {
  constructor() {
    if (_instance) return _instance;
    this._threshold = 25;
    this._isMonitoring = false;
    this._subscription = null;
    this._listeners = [];
    this._events = [];
    _instance = this;
  }

  static getInstance() {
    if (!_instance) _instance = new FallDetectionService();
    return _instance;
  }

  async startMonitoring() {
    if (this._isMonitoring) return;

    const isAvailable = await Accelerometer.isAvailableAsync();
    if (!isAvailable) {
      console.warn('[FallDetection] Accelerometer not available on this device.');
      return;
    }

    Accelerometer.setUpdateInterval(100);
    this._subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z) * 9.81;
      if (magnitude > this._threshold) {
        this.reportFall(magnitude);
      }
    });

    this._isMonitoring = true;
    console.log('[FallDetection] Monitoring started.');
  }

  stopMonitoring() {
    if (this._subscription) {
      this._subscription.remove();
      this._subscription = null;
    }
    this._isMonitoring = false;
  }

  onFallDetected(listener) {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  reportFall(peakAcceleration = 0) {
    const event = {
      id: `fall_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      peakAcceleration,
      confirmed: false,
    };
    this._events.push(event);
    this._listeners.forEach(l => {
      try { l(event); } catch (e) { console.error(e); }
    });
    return event;
  }

  getEvents() { return [...this._events]; }
  isMonitoring() { return this._isMonitoring; }
  setThreshold(t) { this._threshold = Math.max(t, 10); }

  static reset() {
    if (_instance) _instance.stopMonitoring();
    _instance = null;
  }
}

export default FallDetectionService;
