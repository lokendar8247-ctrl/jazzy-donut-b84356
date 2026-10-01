/**
 * Subtle sound notification & browser alert utility for Pomodoro study timer
 */

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Pre-warms the AudioContext on user interaction (clicks, button presses)
 * to satisfy browser autoplay security policies.
 */
export function unlockAudio(): void {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {
    // Ignore audio unlock errors
  }
}

/**
 * Plays a calm, melodic chime notification using Web Audio API.
 * - 'study_complete': 4-note ascending bell chime (C5 - E5 - G5 - C6)
 * - 'break_complete': 2-note calming marimba chime (E5 - C5)
 */
export function playTimerChime(type: 'study_complete' | 'break_complete' = 'study_complete'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === 'study_complete') {
      // 4-note harmonious ascending chime sequence
      const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const stepDuration = 0.16;

      frequencies.forEach((freq, idx) => {
        const startTime = now + idx * stepDuration;

        // Primary bell tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        // Soft harmonic overtone for warm acoustic bell sound
        const overtone = ctx.createOscillator();
        const overtoneGain = ctx.createGain();
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2, startTime);

        // Gain envelope: fast attack, smooth exponential decay
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

        overtoneGain.gain.setValueAtTime(0.0001, startTime);
        overtoneGain.gain.linearRampToValueAtTime(0.05, startTime + 0.015);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        overtone.connect(overtoneGain);
        overtoneGain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.75);
        overtone.start(startTime);
        overtone.stop(startTime + 0.5);
      });
    } else {
      // Calming break finished chime (2 gentle notes)
      const frequencies = [659.25, 523.25]; // E5, C5
      const stepDuration = 0.22;

      frequencies.forEach((freq, idx) => {
        const startTime = now + idx * stepDuration;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });
    }
  } catch {
    // Fail gracefully if Web Audio is unsupported or blocked
  }
}

/**
 * Requests browser notification permission if available
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

/**
 * Sends a browser notification (desktop/mobile notification) and optional haptic vibration
 */
export function sendTimerBrowserNotification(title: string, body: string): void {
  try {
    // 1. Browser Notification API (if permission was granted)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        silent: true, // We already play our bespoke chime
      });
    }

    // 2. Mobile Haptic Vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([180, 80, 180]);
    }
  } catch {
    // Graceful fallback
  }
}
