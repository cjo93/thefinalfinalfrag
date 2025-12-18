
/**
 * HapticService
 * Provides a centralized interface for triggering haptic feedback on supported devices.
 * Uses the Web Vibration API.
 */

export const HapticPatterns = {
    SOFT: 10,       // Very subtle click
    RIGID: 15,      // Sharper click
    SUCCESS: [10, 30, 10], // Double tap
    FAILURE: [50, 100, 50, 100, 50], // Error buzz
    THROB: [20, 100, 20, 100, 20],   // Heartbeat-like
    FLIP: [15, 5, 15], // Card flip sensation
    SOLID: 20 // Solid click
};

class HapticService {
    private enabled: boolean = true;

    constructor() {
        // Check if device supports vibration
        if (typeof navigator !== 'undefined' && !navigator.vibrate) {
            console.debug("Haptics: Not supported on this device.");
            this.enabled = false;
        }
    }

    public trigger(pattern: number | number[]) {
        if (!this.enabled) return;
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.warn("Haptics: Trigger failed", e);
        }
    }

    public toggle(state: boolean) {
        this.enabled = state;
    }
}

export const haptics = new HapticService();
