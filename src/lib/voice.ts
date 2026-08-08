"use client";

import type { VoiceProfile } from "./bot-presentation";

/**
 * Text-to-speech via the browser's built-in speechSynthesis.
 *
 * Three things make this sound like a person rather than a screen reader:
 *  1. Speech is chunked into sentences and clauses and queued with real pauses
 *     between them, so delivery has rhythm. Chunking also sidesteps Chrome's
 *     long-standing bug where utterances beyond ~15s are silently truncated.
 *  2. Voices are scored, not taken first-match — macOS ships joke voices
 *     ("Bahh", "Boing", "Zarvox") under the same locale as real ones.
 *  3. Each character names its preferred voices, so two American speakers are
 *     still audibly different people.
 *
 * Per safety policy these remain generic system voices shaped by style
 * parameters — never cloned identities (docs/SAFETY_AND_LEGAL.md).
 */

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** macOS/Windows novelty and sound-effect voices that must never be picked. */
const NOVELTY = new Set([
  "albert", "bad news", "bahh", "bells", "boing", "bubbles", "cellos",
  "good news", "jester", "organ", "superstar", "trinoids", "whisper",
  "wobble", "zarvox", "deranged", "hysterical", "pipe organ", "princess",
  "bruce", "agnes", "kathy", "vicki", "victoria",
]);

/** Voices that read fine but sound dated; used only as a last resort. */
const DATED = new Set(["fred", "ralph", "junior", "grandpa", "grandma"]);

/**
 * System voices carry no gender metadata, so this maps the known macOS/Windows
 * voice names. Getting this wrong is jarring — a male character answering in a
 * female voice reads as a bug.
 */
const FEMALE_VOICES = new Set([
  "samantha", "kathy", "nicky", "karen", "catherine", "tessa", "martha",
  "flo", "sandy", "shelley", "grandma", "milena", "amélie", "amelie",
  "marie", "alice", "mónica", "monica", "paulina", "alva", "ellen",
  "joana", "luciana", "anna", "helena", "melina", "ioana", "meijia",
  "tingting", "sinji", "yu-shu", "moira", "fiona", "veena", "zosia",
  "zuzana", "yuna", "kyoko", "lekha", "damayanti", "mariska", "sara",
  "nora", "satu", "carmit", "maged",
]);
const MALE_VOICES = new Set([
  "aaron", "arthur", "daniel", "eddy", "reed", "rocko", "fred", "ralph",
  "junior", "gordon", "rishi", "grandpa", "jacques", "thomas", "xander",
  "martin", "li-mu", "yuri", "diego", "jorge", "juan", "luca", "felipe",
  "albert", "bruce", "oliver", "tom", "alex",
]);

function voiceGender(name: string): "m" | "f" | null {
  const n = name.toLowerCase().split(" (")[0].trim();
  if (FEMALE_VOICES.has(n)) return "f";
  if (MALE_VOICES.has(n)) return "m";
  return null;
}

let cached: SpeechSynthesisVoice[] = [];
let readyPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/**
 * getVoices() is populated asynchronously in Chrome and returns [] on the
 * first call, which is why early speech used to lose its accent.
 */
export function voicesReady(): Promise<SpeechSynthesisVoice[]> {
  if (!ttsSupported()) return Promise.resolve([]);
  if (cached.length > 0) return Promise.resolve(cached);
  readyPromise ??= new Promise((resolve) => {
    const attempt = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        cached = v;
        resolve(v);
        return true;
      }
      return false;
    };
    if (attempt()) return;
    window.speechSynthesis.addEventListener("voiceschanged", function once() {
      window.speechSynthesis.removeEventListener("voiceschanged", once);
      attempt();
      resolve(cached);
    });
    // Safari sometimes never fires the event; poll briefly as a safety net.
    let tries = 0;
    const poll = setInterval(() => {
      if (attempt() || ++tries > 20) {
        clearInterval(poll);
        resolve(cached);
      }
    }, 100);
  });
  return readyPromise;
}

function baseLang(lang: string): string {
  return lang.split("-")[0].toLowerCase();
}

/** Higher is better. Novelty voices are filtered out before scoring. */
function score(v: SpeechSynthesisVoice, profile: VoiceProfile): number {
  const name = v.name.toLowerCase();
  let s = 0;
  const want = profile.lang;
  if (want) {
    if (v.lang.toLowerCase() === want.toLowerCase()) s += 100;
    else if (baseLang(v.lang) === baseLang(want)) s += 40;
  }
  // Named preferences are what keep two US speakers distinguishable.
  const prefs = profile.voiceNames ?? [];
  const idx = prefs.findIndex((p) => name.startsWith(p.toLowerCase()));
  if (idx >= 0) s += 200 - idx * 10;
  // Gender match matters more than locale: a male character in a female voice
  // is more jarring than a slightly-off accent.
  const g = voiceGender(v.name);
  if (profile.gender !== "n" && g) {
    s += g === profile.gender ? 90 : -150;
  }
  if (DATED.has(name.split(" (")[0].trim())) s -= 60;
  // Enhanced/premium/neural variants sound markedly better where present.
  if (/(siri|premium|enhanced|neural|natural|google|online)/.test(name)) s += 25;
  if (v.default) s += 5;
  return s;
}

function oppositeOf(g: "m" | "f" | "n"): "m" | "f" | null {
  return g === "m" ? "f" : g === "f" ? "m" : null;
}

export function pickVoice(profile: VoiceProfile): SpeechSynthesisVoice | null {
  const voices = cached.length ? cached : window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const usable = voices.filter((v) => {
    const n = v.name.toLowerCase();
    if (NOVELTY.has(n)) return false;
    // "Bad News (English (US))"-style names also carry the novelty prefix.
    return ![...NOVELTY].some((bad) => n.startsWith(bad + " ("));
  });
  const pool = usable.length ? usable : voices;
  const want = profile.lang;
  const inLang = want
    ? pool.filter((v) => baseLang(v.lang) === baseLang(want))
    : [];
  // Russian, for instance, ships only a female voice on macOS — a male
  // character is better served by a male voice in another locale.
  const genderOk =
    profile.gender === "n"
      ? inLang
      : inLang.filter((v) => voiceGender(v.name) !== oppositeOf(profile.gender));
  const candidates = genderOk.length ? genderOk : inLang.length ? inLang : pool;
  return [...candidates].sort((a, b) => score(b, profile) - score(a, profile))[0] ?? null;
}

export interface SpeakHandle {
  cancel: () => void;
}

// ---------------------------------------------------------------------------
// Neural voices
//
// Browser speechSynthesis cannot sound human — macOS exposes only its compact
// voices to the web. When a TTS provider is configured server-side we stream
// real neural audio instead and keep browser speech purely as a fallback.

let neuralAvailable: boolean | null = null;

export async function neuralReady(): Promise<boolean> {
  if (neuralAvailable !== null) return neuralAvailable;
  try {
    const res = await fetch("/api/tts");
    const data = await res.json();
    neuralAvailable = Boolean(data?.configured);
  } catch {
    neuralAvailable = false;
  }
  return neuralAvailable;
}

/** Speak via the neural provider. Resolves false if it is unavailable. */
async function speakNeural(
  text: string,
  profile: VoiceProfile,
  signal: AbortSignal,
  onAudio: (a: HTMLAudioElement) => void
): Promise<boolean> {
  if (!(await neuralReady())) return false;
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        text,
        voice: profile.neuralVoice ?? (profile.gender === "f" ? "nova" : "onyx"),
        // Character pace carries over to the neural voice.
        speed: Math.max(0.5, Math.min(1.5, profile.rate)),
      }),
    });
    if (!res.ok) return false;
    const url = URL.createObjectURL(await res.blob());
    const audio = new Audio(url);
    onAudio(audio);
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

/**
 * Break a speech into utterance-sized pieces, keeping punctuation so the
 * synthesiser still gets its own intonation cues.
 */
export function chunkSpeech(text: string): { text: string; pauseAfter: number }[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const out: { text: string; pauseAfter: number }[] = [];
  // Sentences, punctuation retained.
  const sentences = clean.match(/[^.!?]+[.!?]*/g) ?? [clean];
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if (sentence.length <= 140) {
      out.push({ text: sentence, pauseAfter: 1 });
      continue;
    }
    // Long sentences get broken at clause boundaries so breaths land naturally.
    const clauses = sentence.split(/(?<=[,;:—–])\s+/);
    let buffer = "";
    for (const clause of clauses) {
      if ((buffer + " " + clause).trim().length > 140 && buffer) {
        out.push({ text: buffer.trim(), pauseAfter: 0.5 });
        buffer = clause;
      } else {
        buffer = buffer ? `${buffer} ${clause}` : clause;
      }
    }
    if (buffer.trim()) out.push({ text: buffer.trim(), pauseAfter: 1 });
  }
  return out;
}

/** Deterministic ±15% jitter so pacing isn't metronomic. */
function jitter(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 0.85 + ((h >>> 0) % 31) / 100;
}

const SENTENCE_PAUSE_MS = 360;
const CLAUSE_PAUSE_MS = 170;

export function speakText(
  text: string,
  profile: VoiceProfile,
  callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
    /** Fires as each chunk begins, for caption highlighting. */
    onChunk?: (index: number, total: number) => void;
  } = {}
): SpeakHandle {
  if (!ttsSupported() || !text.trim()) {
    callbacks.onError?.();
    return { cancel: () => {} };
  }

  const synth = window.speechSynthesis;
  const chunks = chunkSpeech(text);
  if (chunks.length === 0) {
    callbacks.onError?.();
    return { cancel: () => {} };
  }

  let cancelled = false;
  let finished = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let current: SpeechSynthesisUtterance | null = null;
  const pauseScale = profile.pauseScale ?? 1;

  const finish = (errored = false) => {
    if (finished || cancelled) return;
    finished = true;
    if (errored) callbacks.onError?.();
    else callbacks.onEnd?.();
  };

  const speakChunk = (i: number, voice: SpeechSynthesisVoice | null) => {
    if (cancelled || i >= chunks.length) {
      if (!cancelled) finish();
      return;
    }
    const chunk = chunks[i];
    const u = new SpeechSynthesisUtterance(chunk.text);
    if (voice) {
      u.voice = voice;
      // Setting lang alongside the voice keeps pronunciation consistent.
      u.lang = voice.lang;
    }
    u.pitch = Math.max(0, Math.min(2, profile.pitch));
    u.rate = Math.max(0.5, Math.min(1.6, profile.rate));
    current = u;

    let advanced = false;
    const next = () => {
      if (advanced || cancelled) return;
      advanced = true;
      const base =
        chunk.pauseAfter >= 1 ? SENTENCE_PAUSE_MS : CLAUSE_PAUSE_MS;
      const gap = base * pauseScale * jitter(chunk.text);
      timer = setTimeout(() => speakChunk(i + 1, voice), gap);
    };

    u.onstart = () => {
      if (i === 0) callbacks.onStart?.();
      callbacks.onChunk?.(i, chunks.length);
    };
    u.onend = next;
    u.onerror = () => {
      // A failed chunk shouldn't kill the whole speech; carry on.
      if (i === 0 && !advanced) {
        advanced = true;
        finish(true);
        return;
      }
      next();
    };

    synth.speak(u);
  };

  // Clear anything queued, then start on the next tick — speaking immediately
  // after cancel() is unreliable in Chrome.
  synth.cancel();
  const abort = new AbortController();
  let audioEl: HTMLAudioElement | null = null;

  void (async () => {
    // Prefer real neural audio; it is the only thing that stops the bots
    // sounding synthetic.
    const played = await speakNeural(text, profile, abort.signal, (a) => {
      audioEl = a;
      a.onended = () => finish();
      a.onerror = () => finish(true);
      callbacks.onStart?.();
    });
    if (played || cancelled) return;
    const voices = await voicesReady();
    if (cancelled) return;
    const voice = voices.length ? pickVoice(profile) : null;
    timer = setTimeout(() => speakChunk(0, voice), 60);
  })();

  return {
    cancel: () => {
      cancelled = true;
      abort.abort();
      if (timer) clearTimeout(timer);
      if (audioEl) {
        audioEl.onended = null;
        audioEl.onerror = null;
        audioEl.pause();
      }
      if (current) {
        current.onend = null;
        current.onerror = null;
        current.onstart = null;
      }
      synth.cancel();
    },
  };
}

export function stopAllSpeech() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
