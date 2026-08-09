import type { AvatarConfig } from "@/components/cartoon-avatar";

/**
 * Per-bot presentation: stylised cartoon look, generic voice profile, flag and
 * gender. Voices are broad style parameters over the device's built-in TTS —
 * never identity imitation (docs/SAFETY_AND_LEGAL.md). Appearance uses
 * recognisable but deliberately cartoon traits, never likeness artwork.
 */

export interface VoiceProfile {
  /** 0..2 — multiplied onto the base voice. */
  pitch: number;
  /** 0.5..1.5 speaking rate. */
  rate: number;
  /** Preferred BCP-47 tag when picking among installed voices. */
  lang?: string;
  gender: "m" | "f" | "n";
  /**
   * Preferred system-voice names, best first. This is what keeps two speakers
   * of the same locale sounding like different people. Unavailable names fall
   * through to the locale-scored pick, so it degrades safely across devices.
   */
  voiceNames?: string[];
  /** Multiplies the gap between sentences: >1 is a slower, weightier delivery. */
  pauseScale?: number;
  /**
   * Provider preset used when neural TTS is configured. These are stock
   * provider voices picked to suit the character — never voice clones.
   */
  neuralVoice?: string;
}

export interface BotPresentation {
  flag?: string;
  voice: VoiceProfile;
  avatar: AvatarConfig;
  trashTalk?: string[];
}

const male = (
  pitch = 0.95,
  rate = 1,
  lang?: string,
  voiceNames?: string[],
  pauseScale?: number
): VoiceProfile => ({ pitch, rate, lang, gender: "m", voiceNames, pauseScale });

const female = (
  pitch = 1.15,
  rate = 1,
  lang?: string,
  voiceNames?: string[],
  pauseScale?: number
): VoiceProfile => ({ pitch, rate, lang, gender: "f", voiceNames, pauseScale });

export const BOT_PRESENTATION: Record<string, BotPresentation> = {
  // ---- Fictional progression ----------------------------------------------
  raj: {
    flag: "🇮🇳",
    voice: { ...male(0.88, 0.92, "en-IN", ["Rishi"], 1.2), neuralVoice: "echo" },
    avatar: {
      skin: "#b07a4e",
      hair: "short",
      hairColor: "#241f1b",
      hairGrey: true,
      facialHair: "mustache",
      facialHairColor: "#332e29",
      glasses: "square",
      clothing: "sweater",
      clothingColor: "#8a5a3a",
      clothingAccent: "#c8925e",
      mouth: "smile",
      bg: "#413a30",
    },
  },
  rian: {
    flag: "🇨🇭",
    voice: { ...male(1.06, 1.14, "de-DE", [], 0.75), neuralVoice: "verse" },
    avatar: {
      expressive: true,
      skin: "#f0c9a6",
      hair: "short",
      hairColor: "#17130f",
      clothing: "tshirt",
      clothingColor: "#2f7d4f",
      blush: true,
      mouth: "grin",
      bg: "#33403a",
    },
  },
  zak: {
    flag: "🇲🇦",
    voice: { ...male(0.96, 1.0, "en-GB", ["Reed"], 1.0), neuralVoice: "ash" },
    avatar: {
      skin: "#f0c9a6",
      hair: "curly",
      hairColor: "#17130f",
      facialHair: "stubble",
      clothing: "hoodie",
      clothingColor: "#5b6470",
      clothingAccent: "#d8dde4",
      mouth: "smile",
      bg: "#3a3b42",
    },
  },
  mia: {
    flag: "🇸🇪",
    voice: { ...female(1.2, 1.0, "sv-SE", [], 1.1), neuralVoice: "nova" },
    avatar: {
      skin: "#edbf9a",
      hair: "bob",
      hairColor: "#6b4630",
      clothing: "sweater",
      clothingColor: "#9a7fc4",
      clothingAccent: "#c9b8e8",
      blush: true,
      mouth: "smile",
      bg: "#3d3844",
    },
  },
  valentin: {
    flag: "🇳🇱",
    voice: { ...male(0.94, 0.96, "nl-NL", [], 1.15), neuralVoice: "alloy" },
    avatar: {
      skin: "#dfae83",
      hair: "curly",
      hairColor: "#17130f",
      clothing: "shirt",
      clothingColor: "#3d6b96",
      mouth: "neutral",
      bg: "#353c42",
    },
  },
  alex: {
    flag: "🇺🇸",
    voice: { ...male(1.0, 1.06, "en-US", ["Rocko"], 0.95), neuralVoice: "ash" },
    avatar: {
      skin: "#dfa878",
      hair: "curly",
      hairColor: "#4a3320",
      clothing: "tshirt",
      clothingColor: "#b0413a",
      mouth: "smile",
      bg: "#42352f",
    },
  },
  valentina: {
    flag: "🇮🇹",
    voice: { ...female(1.16, 1.0, "it-IT", [], 1.05), neuralVoice: "coral" },
    avatar: {
      skin: "#e2ab7e",
      hair: "long",
      hairColor: "#2e2620",
      clothing: "suit",
      clothingColor: "#5a3b63",
      clothingAccent: "#8a5c96",
      mouth: "smirk",
      bg: "#3e3542",
    },
  },
  ehan: {
    flag: "🇦🇪",
    voice: { ...male(0.92, 0.98, "en-IN", ["Rishi"], 1.15), neuralVoice: "alloy" },
    avatar: {
      skin: "#edc3a0",
      hair: "short",
      hairColor: "#17130f",
      clothing: "shirt",
      clothingColor: "#2f7d76",
      mouth: "neutral",
      bg: "#31403e",
    },
  },
  jack: {
    flag: "🇧🇷",
    voice: { ...male(1.02, 1.16, "pt-BR", [], 0.8), neuralVoice: "ash" },
    avatar: {
      skin: "#c98d5e",
      hair: "curly",
      hairColor: "#1d1712",
      brows: "raised",
      clothing: "hoodie",
      clothingColor: "#2e3f5c",
      clothingAccent: "#9db4d8",
      mouth: "grin",
      teeth: "buck",
      bg: "#33394a",
    },
  },
  jan: {
    flag: "🇨🇭",
    voice: { ...male(0.9, 0.94, "de-CH", [], 1.2), neuralVoice: "onyx" },
    avatar: {
      skin: "#f0cba8",
      hair: "side-part",
      hairColor: "#17130f",
      clothing: "turtleneck",
      clothingColor: "#5c5c60",
      mouth: "neutral",
      bg: "#3b3b40",
    },
  },
  sophie: {
    flag: "🇫🇷",
    voice: { ...female(1.32, 1.2, "fr-FR", [], 0.65), neuralVoice: "coral" },
    avatar: {
      expressive: true,
      skin: "#eeb9a0",
      hair: "wild",
      hairColor: "#7c4a9e",
      accessory: "cat-ears",
      accessoryColor: "#7c4a9e",
      clothing: "sweater",
      clothingColor: "#c05a80",
      clothingAccent: "#eab6cb",
      blush: true,
      mouth: "grin",
      bg: "#44313d",
    },
    trashTalk: [
      "My cats argue better than that at three in the morning.",
      "Ooh, bold claim! Wrong, but bold — I respect the chaos.",
    ],
  },
  "the-barrister": {
    flag: "🇬🇧",
    voice: { ...female(1.04, 0.9, "en-GB", ["Martha"], 1.4), neuralVoice: "shimmer" },
    avatar: {
      skin: "#e6b78f",
      hair: "bob",
      hairColor: "#2a211c",
      accessory: "wig",
      clothing: "robe",
      clothingColor: "#1e1c22",
      clothingAccent: "#c9c4ba",
      mouth: "neutral",
      bg: "#302e33",
    },
    trashTalk: ["Objection: that argument assumes facts not in evidence."],
  },
  "the-professor": {
    flag: "🇬🇧",
    voice: { ...male(0.84, 0.84, "en-GB", ["Daniel"], 1.55), neuralVoice: "onyx" },
    avatar: {
      skin: "#ecc4a1",
      hair: "bald-fringe",
      hairColor: "#b9b2a8",
      facialHair: "full",
      facialHairColor: "#a8a096",
      glasses: "round",
      clothing: "sweater",
      clothingColor: "#6d5136",
      clothingAccent: "#a67f52",
      ageLines: true,
      mouth: "smile",
      bg: "#3d382f",
    },
  },
  "the-strategist": {
    flag: "🇺🇸",
    voice: { ...male(0.88, 0.94, "en-US", ["Aaron"], 1.3), neuralVoice: "echo" },
    avatar: {
      skin: "#d9a679",
      hair: "slick-back",
      hairColor: "#17130f",
      brows: "stern",
      clothing: "suit",
      clothingColor: "#26292e",
      clothingAccent: "#81b64c",
      mouth: "smirk",
      bg: "#2c3130",
    },
    trashTalk: ["I planned for that argument two speeches ago."],
  },
  "the-diplomat": {
    flag: "🇨🇭",
    voice: { ...male(0.96, 0.88, "de-DE", [], 1.4), neuralVoice: "alloy" },
    avatar: {
      skin: "#c99367",
      hair: "side-part",
      hairColor: "#8f8a84",
      clothing: "suit",
      clothingColor: "#2d3f5e",
      clothingAccent: "#5a7db0",
      ageLines: true,
      mouth: "smile",
      bg: "#333a44",
    },
  },
  "debate-engine": {
    voice: { pitch: 1.0, rate: 1.0, gender: "n", pauseScale: 1.0, neuralVoice: "sage" },
    avatar: { robot: true } as AvatarConfig,
  },

  // ---- Business leaders ----------------------------------------------------
  "elon-musk": {
    flag: "🇺🇸",
    voice: { ...male(0.92, 0.88, "en-US", ["Eddy"], 1.6), neuralVoice: "ash" },
    avatar: {
      skin: "#e9c3a1",
      hair: "swept-back",
      hairColor: "#5a4433",
      clothing: "suit",
      clothingColor: "#1e2028",
      clothingAccent: "#2b2b30",
      mouth: "neutral",
      bg: "#2e3138",
    },
    trashTalk: ["Your argument needs a redesign from first principles."],
  },
  "mark-zuckerberg": {
    flag: "🇺🇸",
    voice: { ...male(1.06, 1.05, "en-US", ["Rocko"], 0.85), neuralVoice: "alloy" },
    avatar: {
      skin: "#f2cfae",
      hair: "crew",
      hairColor: "#5a3d28",
      clothing: "tshirt",
      clothingColor: "#8b939e",
      mouth: "neutral",
      bg: "#333a44",
    },
  },
  "steve-jobs": {
    flag: "🇺🇸",
    voice: { ...male(0.94, 0.9, "en-US", ["Reed"], 1.45), neuralVoice: "echo" },
    avatar: {
      skin: "#ecc4a1",
      hair: "receding",
      hairColor: "#5e5852",
      facialHair: "full",
      facialHairColor: "#6e675f",
      glasses: "round",
      clothing: "turtleneck",
      clothingColor: "#1a1a1c",
      ageLines: true,
      mouth: "neutral",
      bg: "#35353a",
    },
  },
  "warren-buffett": {
    flag: "🇺🇸",
    voice: { ...male(0.84, 0.84, "en-US", ["Grandpa", "Aaron"], 1.5), neuralVoice: "onyx" },
    avatar: {
      skin: "#f0cba8",
      hair: "receding",
      hairColor: "#ddd6c9",
      glasses: "square",
      clothing: "suit",
      clothingColor: "#3a3f4a",
      clothingAccent: "#a03434",
      ageLines: true,
      mouth: "smile",
      bg: "#3a3a35",
    },
  },

  // ---- Politicians ---------------------------------------------------------
  "donald-trump": {
    flag: "🇺🇸",
    voice: { ...male(0.72, 0.8, "en-US", ["Aaron"], 1.55), neuralVoice: "onyx" },
    avatar: {
      gesture: "pinch",
      expressive: true,
      skin: "#eeb083",
      hair: "comb-over",
      hairColor: "#e8c25a",
      brows: "stern",
      clothing: "suit",
      clothingColor: "#22304a",
      clothingAccent: "#c03030",
      mouth: "neutral",
      bg: "#3c3430",
    },
    trashTalk: ["That argument? Low energy. Everybody says so."],
  },
  "barack-obama": {
    flag: "🇺🇸",
    voice: { ...male(0.88, 0.82, "en-US", ["Reed"], 1.5), neuralVoice: "echo" },
    avatar: {
      skin: "#9c6b46",
      hair: "receding",
      hairColor: "#2c2926",
      hairGrey: true,
      ears: "large",
      clothing: "suit",
      clothingColor: "#2c3a52",
      clothingAccent: "#4a6ea8",
      mouth: "grin",
      bg: "#333a44",
    },
  },
  "vladimir-putin": {
    flag: "🇷🇺",
    voice: { ...male(0.7, 0.8, "ru-RU", [], 1.35), neuralVoice: "onyx" },
    avatar: {
      skin: "#eec5a3",
      hair: "receding",
      hairColor: "#cfc5b5",
      brows: "stern",
      clothing: "suit",
      clothingColor: "#26262a",
      clothingAccent: "#44444c",
      mouth: "neutral",
      bg: "#333338",
    },
  },
  "zohran-mamdani": {
    flag: "🇺🇸",
    voice: { ...male(1.0, 1.06, "en-US", ["Rocko"], 0.95), neuralVoice: "verse" },
    avatar: {
      skin: "#b07a4e",
      hair: "short",
      hairColor: "#1f1b18",
      facialHair: "full",
      facialHairColor: "#241f1c",
      clothing: "suit",
      clothingColor: "#4a3d30",
      clothingAccent: "#c8a24e",
      mouth: "smile",
      bg: "#3d382f",
    },
  },
  fidias: {
    flag: "🇨🇾",
    voice: { ...male(1.12, 1.18, "el-GR", [], 0.75), neuralVoice: "verse" },
    avatar: {
      expressive: true,
      skin: "#e2ab7e",
      hair: "short",
      hairColor: "#17130f",
      clothing: "tshirt",
      clothingColor: "#3aa0d8",
      mouth: "grin",
      bg: "#2f3c44",
    },
    trashTalk: ["Guys, subscribe to my argument — it's free and it wins."],
  },
  "margaret-thatcher": {
    flag: "🇬🇧",
    voice: { ...female(1.0, 0.86, "en-GB", ["Martha"], 1.3), neuralVoice: "shimmer" },
    avatar: {
      skin: "#f0cba8",
      hair: "bouffant",
      hairColor: "#d8b96a",
      accessory: "pearls",
      clothing: "suit",
      clothingColor: "#28457c",
      clothingAccent: "#c9d4ea",
      ageLines: true,
      mouth: "neutral",
      bg: "#333a48",
    },
    trashTalk: ["The argument's not for turning."],
  },
  "emmanuel-macron": {
    flag: "🇫🇷",
    voice: { ...male(0.98, 1.0, "fr-FR", [], 1.0), neuralVoice: "alloy" },
    avatar: {
      skin: "#eec39c",
      hair: "side-part",
      hairColor: "#6a5238",
      clothing: "suit",
      clothingColor: "#28324a",
      clothingAccent: "#5470ae",
      mouth: "smile",
      bg: "#333844",
    },
  },

  // ---- Football icons ------------------------------------------------------
  "cristiano-ronaldo": {
    flag: "🇵🇹",
    voice: { ...male(1.02, 1.04, "pt-PT", [], 1.0), neuralVoice: "ash" },
    avatar: {
      expressive: true,
      skin: "#cf9a63",
      hair: "crop",
      hairColor: "#191310",
      brows: "thick",
      clothing: "jersey",
      clothingColor: "#b03030",
      clothingAccent: "#2f7d4f",
      mouth: "grin",
      bg: "#3c3232",
    },
    trashTalk: ["Siuuu… that rebuttal went over the bar."],
  },
  "zlatan-ibrahimovic": {
    flag: "🇸🇪",
    voice: { ...male(0.74, 0.86, "sv-SE", [], 1.4), neuralVoice: "onyx" },
    avatar: {
      expressive: true,
      skin: "#d9a778",
      hair: "top-knot",
      hairColor: "#231d18",
      facialHair: "goatee",
      facialHairColor: "#231d18",
      brows: "stern",
      clothing: "tshirt",
      clothingColor: "#1c1c22",
      mouth: "smirk",
      bg: "#34343c",
    },
    trashTalk: ["Zlatan does not lose arguments. Arguments lose to Zlatan."],
  },
  "lionel-messi": {
    flag: "🇦🇷",
    voice: { ...male(1.06, 0.9, "es-MX", [], 1.25), neuralVoice: "alloy" },
    avatar: {
      skin: "#e9bd94",
      hair: "short",
      hairColor: "#5a4028",
      facialHair: "full",
      facialHairColor: "#7a4e2c",
      clothing: "jersey",
      clothingColor: "#7fc0e8",
      clothingAccent: "#ffffff",
      mouth: "smile",
      bg: "#31404a",
    },
  },
  "jose-mourinho": {
    flag: "🇵🇹",
    voice: { ...male(0.86, 0.88, "pt-PT", [], 1.35), neuralVoice: "echo" },
    avatar: {
      skin: "#e6b78f",
      hair: "receding",
      hairColor: "#9e968c",
      facialHair: "stubble",
      facialHairColor: "#8e867c",
      brows: "stern",
      clothing: "suit",
      clothingColor: "#33363e",
      clothingAccent: "#5a5e68",
      ageLines: true,
      mouth: "smirk",
      bg: "#36363b",
    },
    trashTalk: ["I prefer not to speak. But if I speak, your case is in big trouble."],
  },

  // ---- Creators ------------------------------------------------------------
  ishowspeed: {
    flag: "🇺🇸",
    voice: { ...male(1.38, 1.34, "en-US", ["Junior", "Rocko"], 0.5), neuralVoice: "verse" },
    avatar: {
      expressive: true,
      skin: "#8a5a38",
      hair: "short",
      hairColor: "#17130f",
      accessory: "headband",
      accessoryColor: "#e8e4da",
      clothing: "tshirt",
      clothingColor: "#c03030",
      mouth: "grin",
      bg: "#402f2f",
    },
    trashTalk: ["BRO. That argument is NOT it. It is NOT it!"],
  },
  mrbeast: {
    flag: "🇺🇸",
    voice: { ...male(1.06, 1.22, "en-US", ["Rocko"], 0.6), neuralVoice: "ash" },
    avatar: {
      expressive: true,
      skin: "#f0c9a6",
      hair: "swoop",
      hairColor: "#6b4a2c",
      facialHair: "stubble",
      facialHairColor: "#5a3d24",
      brows: "raised",
      clothing: "tshirt",
      clothingColor: "#2f6fd0",
      clothingAccent: "#ffffff",
      mouth: "grin",
      bg: "#2f3c48",
    },
    trashTalk: ["I'd give you $10,000 if that argument held up. It doesn't."],
  },
  pewdiepie: {
    flag: "🇸🇪",
    voice: { ...male(1.02, 1.12, "sv-SE", [], 0.8), neuralVoice: "alloy" },
    avatar: {
      skin: "#f0c9a6",
      hair: "short",
      hairColor: "#d8b96a",
      facialHair: "full",
      facialHairColor: "#c4a04e",
      accessory: "headphones",
      accessoryColor: "#2b2b30",
      clothing: "tshirt",
      clothingColor: "#1c1c22",
      mouth: "smile",
      bg: "#38333c",
    },
  },
  ksi: {
    flag: "🇬🇧",
    voice: { ...male(0.94, 1.16, "en-GB", ["Rocko", "Eddy"], 0.7), neuralVoice: "ash" },
    avatar: {
      expressive: true,
      skin: "#75492b",
      hair: "locs-up",
      hairColor: "#17130f",
      facialHair: "chinstrap",
      facialHairColor: "#17130f",
      accessory: "bandana",
      accessoryColor: "#1b1b1f",
      clothing: "hoodie",
      clothingColor: "#1c1c20",
      clothingAccent: "#e6e6e8",
      mouth: "grin",
      bg: "#3a3230",
    },
  },
  "niko-omilana": {
    flag: "🇬🇧",
    voice: { ...male(1.04, 1.06, "en-GB", ["Arthur"], 0.85), neuralVoice: "verse" },
    avatar: {
      expressive: true,
      skin: "#a8703f",
      hair: "buzz",
      hairColor: "#17130f",
      glasses: "round",
      glassesColor: "#43c04a",
      clothing: "suit",
      clothingColor: "#26262a",
      clothingAccent: "#3a3a42",
      mouth: "grin",
      bg: "#333036",
    },
    trashTalk: ["This is a certified argument-destruction moment."],
  },

  // ---- Political commentators ---------------------------------------------
  "mehdi-hasan": {
    flag: "🇬🇧",
    voice: { ...male(1.0, 1.16, "en-GB", ["Daniel"], 0.75), neuralVoice: "ash" },
    avatar: {
      expressive: true,
      skin: "#c08a58",
      hair: "receding",
      hairColor: "#241f1c",
      glasses: "square",
      clothing: "suit",
      clothingColor: "#3a3f4a",
      clothingAccent: "#5a6a8e",
      mouth: "neutral",
      bg: "#35383f",
    },
    trashTalk: ["I have your own quote right here, and it disagrees with you."],
  },
  "piers-morgan": {
    flag: "🇬🇧",
    voice: { ...male(0.88, 1.04, "en-GB", ["Arthur"], 0.9), neuralVoice: "echo" },
    avatar: {
      expressive: true,
      skin: "#eec5a3",
      hair: "short",
      hairColor: "#8a8078",
      clothing: "suit",
      clothingColor: "#2c3a52",
      clothingAccent: "#7a4a9e",
      ageLines: true,
      mouth: "smirk",
      bg: "#36363e",
    },
  },
  "tucker-carlson": {
    flag: "🇺🇸",
    voice: { ...male(0.96, 0.94, "en-US", ["Eddy"], 1.2), neuralVoice: "alloy" },
    avatar: {
      expressive: true,
      skin: "#f0cba8",
      hair: "side-part",
      hairColor: "#7a5c38",
      brows: "raised",
      clothing: "suit",
      clothingColor: "#3d4a3a",
      clothingAccent: "#a03434",
      mouth: "neutral",
      bg: "#383c34",
    },
  },
  "ben-shapiro": {
    flag: "🇺🇸",
    voice: { ...male(1.18, 1.4, "en-US", ["Rocko"], 0.45), neuralVoice: "verse" },
    avatar: {
      expressive: true,
      skin: "#eec39c",
      hair: "side-part",
      hairColor: "#2a211c",
      clothing: "suit",
      clothingColor: "#44454c",
      clothingAccent: "#3a6ea8",
      mouth: "neutral",
      bg: "#36363c",
    },
    trashTalk: ["Facts don't care about that argument."],
  },
  "jordan-peterson": {
    flag: "🇨🇦",
    voice: { ...male(1.12, 0.88, "en-US", ["Reed"], 1.5), neuralVoice: "echo" },
    avatar: {
      skin: "#ecc4a1",
      hair: "slick-back",
      hairColor: "#9e968c",
      facialHair: "stubble",
      facialHairColor: "#8e867c",
      brows: "stern",
      clothing: "suit",
      clothingColor: "#4a3a30",
      clothingAccent: "#8a6a4a",
      ageLines: true,
      mouth: "neutral",
      bg: "#3c352f",
    },
    trashTalk: ["Well, that's not an argument — that's approximately chaos."],
  },

  // ---- Academic debaters (no flags: avoid misassigning real people) --------
  "udai-kamath": {
    flag: "🇮🇳",
    voice: { ...male(1.0, 1.08, "en-IN", ["Rishi"], 0.95), neuralVoice: "verse" },
    avatar: {
      skin: "#b07a4e",
      hair: "short",
      hairColor: "#17130f",
      glasses: "square",
      clothing: "shirt",
      clothingColor: "#3d5a78",
      mouth: "smile",
      bg: "#333a42",
    },
  },
  "jack-story": {
    flag: "🇬🇧",
    voice: { ...male(0.98, 1.04, "en-GB", ["Daniel"], 1.0), neuralVoice: "ash" },
    avatar: {
      skin: "#eec39c",
      hair: "short",
      hairColor: "#6b4a2c",
      clothing: "sweater",
      clothingColor: "#2f6b4f",
      clothingAccent: "#5a9e7c",
      mouth: "smile",
      bg: "#303a34",
    },
  },
  "mark-rothery": {
    flag: "🇬🇧",
    voice: { ...male(0.92, 0.98, "en-GB", ["Arthur"], 1.15), neuralVoice: "echo" },
    avatar: {
      skin: "#f0c9a6",
      hair: "side-part",
      hairColor: "#a08050",
      clothing: "shirt",
      clothingColor: "#4a6a92",
      mouth: "neutral",
      bg: "#353a42",
    },
  },
  "aniket-chakravorty": {
    flag: "🇮🇳",
    voice: { ...male(0.96, 1.06, "en-IN", ["Rishi"], 1.0), neuralVoice: "alloy" },
    avatar: {
      skin: "#a06a42",
      hair: "short",
      hairColor: "#17130f",
      facialHair: "stubble",
      clothing: "sweater",
      clothingColor: "#7c3a44",
      clothingAccent: "#a85a66",
      mouth: "smile",
      bg: "#3c3236",
    },
  },
  "david-africa": {
    flag: "🇿🇦",
    voice: { ...male(0.86, 0.96, "en-ZA", ["Tessa"], 1.2), neuralVoice: "onyx" },
    avatar: {
      skin: "#6e442a",
      hair: "crew",
      hairColor: "#17130f",
      clothing: "suit",
      clothingColor: "#3a3f4a",
      clothingAccent: "#6a7a9a",
      mouth: "smile",
      bg: "#34363c",
    },
  },
  "tobi-leung": {
    flag: "🇭🇰",
    voice: { ...male(1.02, 1.04, "en-AU", ["Gordon"], 1.0), neuralVoice: "verse" },
    avatar: {
      skin: "#e9bd94",
      hair: "short",
      hairColor: "#17130f",
      glasses: "round",
      clothing: "hoodie",
      clothingColor: "#2e3f5c",
      clothingAccent: "#8fa8ce",
      mouth: "smile",
      bg: "#333846",
    },
  },
};

export function presentationFor(slug: string): BotPresentation {
  return (
    BOT_PRESENTATION[slug] ?? {
      voice: { pitch: 1, rate: 1, gender: "n" },
      avatar: { robot: true } as AvatarConfig,
    }
  );
}
