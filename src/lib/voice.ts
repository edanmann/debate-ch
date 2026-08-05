"use client";

import type { VoiceProfile } from "./bot-presentation";

/**
 * Text-to-speech via the browser's built-in speechSynthesis.
 * Per safety policy, voices are generic system voices shaped by broad style
 * parameters (pitch/rate/language preference) — never cloned identities.
 */

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoices: SpeechSynthesisVoice[] | null = null;

function loadVoices(): SpeechSynthesisVoice[] {
  if (!ttsSupported()) return [];
  const v = window.speechSynthesis.getVoices();
  if (v.length > 0) cachedVoices = v;
  return cachedVoices ?? [];
}

if (typeof window !== "undefined" && ttsSupported()) {
  window.speechSynthesis.onvoiceschanged = () => loadVoices();
}

function pickVoice(profile: VoiceProfile): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (voices.length === 0) return null;
  const lang = profile.lang;
  if (lang) {
    const exact = voices.find((v) => v.lang === lang);
    if (exact) return exact;
    const base = lang.split("-")[0];
    const partial = voices.find((v) => v.lang.startsWith(base));
    if (partial) return partial;
  }
  return voices.find((v) => v.default) ?? voices[0];
}

export interface SpeakHandle {
  cancel: () => void;
}

export function speakText(
  text: string,
  profile: VoiceProfile,
  callbacks: { onStart?: () => void; onEnd?: () => void; onError?: () => void } = {}
): SpeakHandle {
  if (!ttsSupported() || !text.trim()) {
    callbacks.onError?.();
    return { cancel: () => {} };
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(profile);
  if (voice) utterance.voice = voice;
  utterance.pitch = Math.max(0, Math.min(2, profile.pitch));
  utterance.rate = Math.max(0.5, Math.min(1.6, profile.rate));
  let done = false;
  utterance.onstart = () => callbacks.onStart?.();
  utterance.onend = () => {
    if (!done) {
      done = true;
      callbacks.onEnd?.();
    }
  };
  utterance.onerror = () => {
    if (!done) {
      done = true;
      callbacks.onError?.();
    }
  };
  synth.speak(utterance);
  return {
    cancel: () => {
      done = true;
      synth.cancel();
    },
  };
}

export function stopAllSpeech() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
