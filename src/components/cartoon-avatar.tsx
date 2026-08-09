/**
 * Parametric cartoon avatar system — original flat 2D illustration built from
 * configurable features (skin, hair, facial hair, glasses, clothing,
 * accessories). Real-person bots use *stylised* recognisable traits, never
 * photorealistic likenesses (docs/SAFETY_AND_LEGAL.md). The mouth animates
 * while `speaking`.
 */

export interface AvatarConfig {
  skin: string;
  hair:
    | "none"
    | "bald-fringe"
    | "short"
    | "crew"
    | "buzz"
    | "swoop"
    | "side-part"
    | "curly"
    | "bun"
    | "top-knot"
    | "dreads"
    | "long"
    | "bob"
    | "bouffant"
    | "ponytail"
    | "wild"
    | "afro"
    | "quiff"
    | "comb-over"
    | "swept-back"
    | "crop"
    | "locs-up"
    | "slick-back"
    | "receding";
  hairColor: string;
  /** Grey at the temples, for characters who read as middle-aged. */
  hairGrey?: boolean;
  facialHair?: "none" | "mustache" | "beard" | "full" | "goatee" | "stubble" | "chinstrap";
  facialHairColor?: string;
  glasses?: "none" | "square" | "round";
  /** Frame colour; defaults to near-black. */
  glassesColor?: string;
  brows?: "normal" | "stern" | "raised" | "thick";
  mouth?: "smile" | "grin" | "neutral" | "smirk";
  /** Prominent upper front teeth, shown with a grin. */
  teeth?: "normal" | "buck";
  /** Oversized ears, a strong recognition cue on some faces. */
  ears?: "normal" | "large";
  clothing: "suit" | "turtleneck" | "hoodie" | "jersey" | "sweater" | "shirt" | "tshirt" | "robe";
  clothingColor: string;
  clothingAccent?: string;
  accessory?: "none" | "wig" | "cat-ears" | "headphones" | "cap" | "pearls" | "headband" | "bandana";
  accessoryColor?: string;
  ageLines?: boolean;
  blush?: boolean;
  bg?: string;
  robot?: boolean;
  /** Hands that appear and animate while speaking. */
  gesture?: "none" | "pinch" | "point" | "open" | "fist";
  /** Exaggerated brow/mouth movement while speaking. */
  expressive?: boolean;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: "#e8b48c",
  hair: "short",
  hairColor: "#4a3626",
  clothing: "tshirt",
  clothingColor: "#5b7d9e",
};

/**
 * Hair geometry.
 *
 * The skull is an ellipse at cx 50, cy 47, rx 24, ry 26 — so its crown sits at
 * y 21 and its sides at x 26/74. Every style below starts from an outer cap
 * that deliberately overshoots those bounds (crown ~y 15, sides ~x 22/78) and
 * then cuts a hairline back in. Overshooting is what stops a sliver of scalp
 * showing through between the hair and the top of the head.
 */

/**
 * Outer cap: left side → crown → right side.
 *
 * It *starts and ends on the skull edge* (x 26/74 at y 47) and bulges outside
 * the skull everywhere above that. Anchoring the ends this way is what stops a
 * sliver of background showing between the side of the head and the hair —
 * a cap that is wider than the skull at ear height leaves exactly that gap.
 */
const CAP = "M26 47 C25 24 33 15.5 50 15.5 C67 15.5 75 24 74 47";
/** Lower-volume cap for cropped styles. */
const CAP_LOW = "M26.5 46 C26 26 34 18 50 18 C66 18 74 26 73.5 46";

/** Hairline curves, written right → left to close the cap into a crescent. */
const HAIRLINE = {
  /** Rounded, sits mid-forehead. */
  round: "C73 37 67 30 50 30 C33 30 27 37 26 47 Z",
  /** Cropped: higher on the forehead. */
  high: "C72.5 37 66.5 32 50 32 C33.5 32 27.5 37 26.5 46 Z",
  /** Buzzed: barely leaves a forehead at all. */
  tight: "C72.5 39 66.5 34 50 34 C33.5 34 27.5 39 26.5 46 Z",
  /** Combed straight back — a clean, high line. */
  back: "C73 35 67 27.5 50 27.5 C33 27.5 27 35 26 47 Z",
  /** Temples pulled back, centre still high. */
  receded: "C73 38 70 30 63 28 C57.5 25.5 42.5 25.5 37 28 C30 30 27 38 26 47 Z",
} as const;

/** Main filled shape for a style, reused by the greying pass. */
function hairSilhouette(cfg: AvatarConfig): string | null {
  switch (cfg.hair) {
    case "receding":
      return `${CAP} ${HAIRLINE.receded}`;
    case "short":
    case "curly":
    case "dreads":
    case "wild":
      return `${CAP} ${HAIRLINE.round}`;
    case "crew":
      return `${CAP_LOW} ${HAIRLINE.high}`;
    case "buzz":
      return `${CAP_LOW} ${HAIRLINE.tight}`;
    case "slick-back":
    case "bun":
    case "top-knot":
    case "ponytail":
      return `${CAP} ${HAIRLINE.back}`;
    case "side-part":
      return `${CAP} C73.5 35 68 29.5 56 29 C57 30.5 57.2 31.6 56.4 32.4 C48 29.6 34.5 30 29.5 34.5 C27 37 26.5 41 26 47 Z`;
    default:
      return null;
  }
}

function Hair({ cfg }: { cfg: AvatarConfig }) {
  const c = cfg.hairColor;
  switch (cfg.hair) {
    case "none":
      return null;
    case "bald-fringe":
      return (
        <path
          d="M26 46 C26 36 28.5 29 33 26 C31 34 33 39 35 41 L35 48 C31.5 50 27.5 49 26 46 Z M74 46 C74 36 71.5 29 67 26 C69 34 67 39 65 41 L65 48 C68.5 50 72.5 49 74 46 Z"
          fill={c}
        />
      );
    case "receding":
      return <path d={`${CAP} ${HAIRLINE.receded}`} fill={c} />;
    case "short":
      return <path d={`${CAP} ${HAIRLINE.round}`} fill={c} />;
    case "crew":
      return <path d={`${CAP_LOW} ${HAIRLINE.high}`} fill={c} />;
    case "buzz":
      return <path d={`${CAP_LOW} ${HAIRLINE.tight}`} fill={c} />;
    case "swoop":
      return (
        <path
          d={`${CAP} C73 36 68 28.5 58 28 C45 27 34 30.5 30.5 38.5 C29 42.5 29 46 30 49.5 C28 49 26.5 49.5 26 47 Z`}
          fill={c}
        />
      );
    case "side-part":
      return (
        <path
          d={`${CAP} C73.5 35 68 29.5 56 29 C57 30.5 57.2 31.6 56.4 32.4 C48 29.6 34.5 30 29.5 34.5 C27 37 26.5 41 26 47 Z`}
          fill={c}
        />
      );
    case "quiff":
      return (
        // Tight sides with the volume pushed up and forward at the front.
        <path
          d="M27.5 46 C27 34 28.5 26.5 32.5 21 C37 15.5 43 10.5 50.5 10 C61.5 9.5 73 20 73.5 46 C72.5 35 65.5 30.5 50 30.5 C34.5 30.5 28.5 35 27.5 46 Z"
          fill={c}
        />
      );
    case "comb-over":
      return (
        // Volume swept up and across, flaring wider than the head above the
        // ears — the whole silhouette, not just the colour, does the work.
        <g>
          <path
            d="M26 47 C24 33 25.5 19 35 14 C44 10 56.5 10.5 64.5 15 C73 20 76 33 74 47 C73 39 70.5 33.5 63 32 C55 30 41 32.5 34.5 38 C31 41 27.5 43.5 26 47 Z"
            fill={c}
          />
          {/* The comb line: what makes it read as swept rather than a helmet. */}
          <path
            d="M31 29 C41 21.5 55 20.5 69 26"
            stroke="#00000026"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "swept-back":
      return (
        // Deep temple recessions with a small central peak between them.
        <path
          d="M26 47 C24.5 25 32 13 50 13 C68 13 75.5 25 74 47 C73 36 71 29.5 63 28 C58.5 27.5 54 28.5 50 31 C46 28.5 41.5 27.5 37 28 C29 29.5 27 36 26 47 Z"
          fill={c}
        />
      );
    case "crop":
      return (
        <g fill={c}>
          {/* Tight sides, low straight hairline, a little texture on top. */}
          <path d="M26.5 46 C26 34 27.5 25 33 20.5 C39 16 45 14.6 51 14.9 C61 15.4 71.5 21 73 33 C73.6 37.5 73.8 42 73.5 46 C72.5 37.5 66 32.5 50 32.5 C34 32.5 27.5 37 26.5 46 Z" />
          {/* Faded sides: the hair thins as it drops toward the ears. */}
          <path
            d="M27 44 C27.5 37.5 30 33.5 34 31.5 C31.5 35.5 30.5 40 30.5 45 Z M73 44 C72.5 37.5 70 33.5 66 31.5 C68.5 35.5 69.5 40 69.5 45 Z"
            opacity="0.55"
          />
        </g>
      );
    case "locs-up":
      return (
        <g fill={c}>
          <path d={`${CAP} ${HAIRLINE.round}`} />
          {/* Locs flicking upward, the way they sit above a tied band. */}
          <path d="M33 23 C29 17 27.5 11 30 7.5 C31 12 34.5 16.5 38 20 Z" />
          <path d="M41.5 20 C39.5 14 39 8.5 41.5 5.5 C43 10.5 45.5 14.5 47 17.5 Z" />
          <path d="M50.5 18.5 C50 12.5 51.5 7.5 54.5 5.5 C53.5 10.5 55 14 56.5 17 Z" />
          <path d="M60 20 C61.5 14.5 64 10 67 8.5 C64.5 12.5 63.5 16.5 64 19.5 Z" />
          <path d="M67 24 C70 19 73.5 15.5 76.5 14.5 C73.5 18.5 71.5 22.5 71.5 26 Z" />
          <path d="M45.5 17 C45 11.5 46.5 7.5 49 6 C47.5 10 47.5 13.5 48.5 16.5 Z" />
        </g>
      );
    case "curly":
      return (
        <g fill={c}>
          {/* Solid base first: the curls only add silhouette, never coverage. */}
          <path d={`${CAP} ${HAIRLINE.round}`} />
          <circle cx="30" cy="34" r="8.5" />
          <circle cx="40" cy="26" r="9" />
          <circle cx="51" cy="23.5" r="9" />
          <circle cx="62" cy="26" r="9" />
          <circle cx="71" cy="34" r="8.5" />
          <circle cx="25.5" cy="43" r="6.5" />
          <circle cx="74.5" cy="43" r="6.5" />
        </g>
      );
    case "bun":
      return (
        <g fill={c}>
          <circle cx="50" cy="18" r="8.5" />
          <path d={`${CAP} ${HAIRLINE.back}`} />
        </g>
      );
    case "top-knot":
      return (
        <g fill={c}>
          {/* Knot gathered high at the back, reading as a bump behind the crown. */}
          <ellipse cx="63" cy="17" rx="9" ry="7.5" />
          <path d={`${CAP} ${HAIRLINE.back}`} />
          <path d="M60 21 C68 22 72 27 72 33 C69 28 65 25 59 24 Z" />
        </g>
      );
    case "dreads":
      return (
        <g fill={c}>
          <path d={`${CAP} ${HAIRLINE.round}`} />
          <rect x="22" y="34" width="5.5" height="17" rx="2.75" />
          <rect x="29" y="27" width="5.5" height="15" rx="2.75" />
          <rect x="65.5" y="27" width="5.5" height="15" rx="2.75" />
          <rect x="72.5" y="34" width="5.5" height="17" rx="2.75" />
        </g>
      );
    case "long":
      return (
        <path
          d="M21 80 C19 32 32 15.5 50 15.5 C68 15.5 81 32 79 80 L69.5 78 C71.5 46 70 34 64 30 C56.5 25 43.5 25 36 30 C30 34 28.5 46 30.5 78 Z"
          fill={c}
        />
      );
    case "bob":
      return (
        <path
          d="M21.5 65 C19.5 31 32 15.5 50 15.5 C68 15.5 80.5 31 78.5 65 L69.5 65.5 C71.5 45 70 34 64 30 C56.5 25 43.5 25 36 30 C30 34 28.5 45 30.5 65.5 Z"
          fill={c}
        />
      );
    case "bouffant":
      return (
        <path
          d="M21 50 C19 22 32 11.5 50 11.5 C68 11.5 81 22 79 50 C77 51 75 51 74 49.5 C76 32 71 27 64 25.5 C56.5 23 43.5 23 36 25.5 C29 27 24 32 26 49.5 C25 51 23 51 21 50 Z"
          fill={c}
        />
      );
    case "ponytail":
      return (
        <g fill={c}>
          <path d="M69 32 C81 39 79 58 73 70 C71 73 68 74 66 73 C71 62 72 50 68 42 Z" />
          <path d={`${CAP} ${HAIRLINE.back}`} />
        </g>
      );
    case "wild":
      return (
        <g fill={c}>
          <path d={`${CAP} ${HAIRLINE.round}`} />
          <path d="M23 33 l-7 -9 7 2 -3 -9 7 7 0 -9 6 9 z" />
          <path d="M77 33 l7 -9 -7 2 3 -9 -7 7 0 -9 -6 9 z" />
          <path d="M50 15 l-4 -11 7 5 3 -8 3 9 6 -5 -3 11 z" />
        </g>
      );
    case "afro":
      return <circle cx="50" cy="31" r="24" fill={c} />;
    case "slick-back":
      return <path d={`${CAP} ${HAIRLINE.back}`} fill={c} />;
    default:
      return null;
  }
}

/**
 * Grey at the temples. Painted as a second pass of the *same* silhouette with
 * a gradient that only reaches the sides, so the grey can never spill onto the
 * forehead or over an ear the way free-floating patches would.
 */
const GREY_GRADIENT_ID = "debates-hair-grey";

function TempleGrey({ cfg, gradientId }: { cfg: AvatarConfig; gradientId: string }) {
  const d = hairSilhouette(cfg);
  if (!cfg.hairGrey || !d) return null;
  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#d5d2cc" stopOpacity="0.6" />
          <stop offset="0.12" stopColor="#d5d2cc" stopOpacity="0.34" />
          <stop offset="0.24" stopColor="#d5d2cc" stopOpacity="0" />
          <stop offset="0.76" stopColor="#d5d2cc" stopOpacity="0" />
          <stop offset="0.88" stopColor="#d5d2cc" stopOpacity="0.34" />
          <stop offset="1" stopColor="#d5d2cc" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${gradientId})`} />
    </>
  );
}

function FacialHair({ cfg }: { cfg: AvatarConfig }) {
  const c = cfg.facialHairColor ?? cfg.hairColor;
  switch (cfg.facialHair) {
    case "mustache":
      return <path d="M40 60 q10 -5 20 0 q-5 4 -10 3 q-5 1 -10 -3" fill={c} />;
    case "goatee":
      return (
        <g fill={c}>
          <path d="M41 60 q9 -4 18 0 q-4 3 -9 3 q-5 0 -9 -3" />
          <path d="M44 68 q6 4 12 0 q0 7 -6 7 q-6 0 -6 -7" />
        </g>
      );
    case "beard":
      return (
        <path d="M30 52 q0 20 20 20 q20 0 20 -20 l-3 0 q0 12 -8 15 l0 -6 q-9 4 -18 0 l0 6 q-8 -3 -8 -15 z" fill={c} />
      );
    case "full":
      return (
        <g fill={c}>
          <path d="M29 50 q-1 24 21 24 q22 0 21 -24 l-4 -2 q2 18 -8 20 l0 -8 q-9 5 -18 0 l0 8 q-10 -2 -8 -20 z" />
          <path d="M40 59 q10 -5 20 0 q-5 4 -10 3 q-5 1 -10 -3" />
        </g>
      );
    case "chinstrap":
      return (
        <g fill={c}>
          {/* A thin line following the jaw rather than a full beard. */}
          <path d="M31.5 53 C31.5 68 39.5 73.5 50 73.5 C60.5 73.5 68.5 68 68.5 53 C66.5 65.5 60 69.5 50 69.5 C40 69.5 33.5 65.5 31.5 53 Z" />
          <path d="M41 57.5 q9 -4 18 0 q-4.5 3.5 -9 2.5 q-4.5 1 -9 -2.5" />
        </g>
      );
    case "stubble":
      return (
        <path d="M33 56 q0 13 17 13 q17 0 17 -13 q-2 9 -17 9 q-15 0 -17 -9" fill={c} opacity="0.45" />
      );
    default:
      return null;
  }
}

function Accessory({ cfg }: { cfg: AvatarConfig }) {
  const c = cfg.accessoryColor ?? "#dddddd";
  switch (cfg.accessory) {
    case "wig":
      return (
        <g fill="#e8e4da">
          <path d="M24 60 q-6 -38 26 -38 q32 0 26 38 l-7 1 q4 -30 -6 -32 q-13 -4 -26 0 q-10 2 -6 32 z" />
          <circle cx="27" cy="46" r="4" /><circle cx="27" cy="54" r="4" />
          <circle cx="73" cy="46" r="4" /><circle cx="73" cy="54" r="4" />
        </g>
      );
    case "cat-ears":
      return (
        <g>
          <path d="M30 30 l-4 -14 14 8z" fill={c} />
          <path d="M70 30 l4 -14 -14 8z" fill={c} />
          <path d="M31 28 l-2 -8 8 5z" fill="#f2a7c3" />
          <path d="M69 28 l2 -8 -8 5z" fill="#f2a7c3" />
        </g>
      );
    case "headphones":
      return (
        <g fill={c}>
          <path d="M26 42 q0 -22 24 -22 q24 0 24 22 l-4 0 q0 -18 -20 -18 q-20 0 -20 18 z" />
          <rect x="22" y="40" width="8" height="14" rx="4" />
          <rect x="70" y="40" width="8" height="14" rx="4" />
        </g>
      );
    case "cap":
      return (
        <g fill={c}>
          <path d="M26 38 q0 -16 24 -16 q24 0 24 16 l0 3 q-24 -6 -48 0 z" />
          <path d="M22 40 q28 -7 56 0 l0 4 q-28 -6 -56 0 z" />
        </g>
      );
    case "pearls":
      return (
        <g fill="#f0ead8">
          <circle cx="40" cy="78" r="2.5" /><circle cx="46" cy="80" r="2.5" />
          <circle cx="54" cy="80" r="2.5" /><circle cx="60" cy="78" r="2.5" />
        </g>
      );
    case "headband":
      return <rect x="27" y="30" width="46" height="6" rx="3" fill={c} />;
    case "bandana":
      return (
        <g>
          {/* Tied band across the brow, knotted off to one side. */}
          <path
            d="M26 43 C26 32.5 34 25.5 50 25.5 C66 25.5 74 32.5 74 43 C74 36.5 66 31 50 31 C34 31 26 36.5 26 43 Z"
            fill={c}
          />
          <path d="M71.5 31 L78.5 28 L76.5 34 L80.5 36.5 L73.5 37 Z" fill={c} />
          <g fill={cfg.clothingAccent ?? "#e6e6e8"} opacity="0.85">
            <circle cx="34" cy="36.5" r="1.3" />
            <circle cx="42" cy="33.5" r="1.3" />
            <circle cx="50" cy="32.6" r="1.3" />
            <circle cx="58" cy="33.5" r="1.3" />
            <circle cx="66" cy="36.5" r="1.3" />
            <circle cx="38" cy="39.5" r="1" />
            <circle cx="62" cy="39.5" r="1" />
          </g>
        </g>
      );
    default:
      return null;
  }
}

function Clothing({ cfg }: { cfg: AvatarConfig }) {
  const c = cfg.clothingColor;
  const accent = cfg.clothingAccent ?? "#ffffff";
  const base = <path d="M18 100 q2 -22 32 -24 q30 2 32 24 z" fill={c} />;
  switch (cfg.clothing) {
    case "suit":
      return (
        <g>
          {base}
          <path d="M43 77 l7 6 7 -6 -2 22 -10 0z" fill={accent === "#ffffff" ? "#f4f4f4" : "#f4f4f4"} />
          <path d="M50 83 l4 5 -4 10 -4 -10z" fill={cfg.clothingAccent ?? "#b03030"} />
        </g>
      );
    case "turtleneck":
      return (
        <g>
          {base}
          <rect x="40" y="72" width="20" height="9" rx="4" fill={c} />
        </g>
      );
    case "hoodie":
      return (
        <g>
          {base}
          <path d="M36 80 q14 8 28 0 l2 5 q-16 9 -32 0 z" fill={accent} opacity="0.35" />
          <line x1="45" y1="84" x2="45" y2="96" stroke={accent} strokeWidth="2" />
          <line x1="55" y1="84" x2="55" y2="96" stroke={accent} strokeWidth="2" />
        </g>
      );
    case "jersey":
      return (
        <g>
          {base}
          <path d="M34 84 l0 16 6 0 0 -16z M46 82 l0 18 8 0 0 -18z M60 84 l0 16 6 0 0 -16z" fill={accent} opacity="0.85" />
        </g>
      );
    case "sweater":
      return (
        <g>
          {base}
          <path d="M40 78 q10 6 20 0 l0 4 q-10 6 -20 0z" fill={accent} opacity="0.5" />
        </g>
      );
    case "shirt":
      return (
        <g>
          {base}
          <path d="M44 78 l6 5 6 -5 -1 4 -5 4 -5 -4z" fill={accent} />
        </g>
      );
    case "robe":
      return (
        <g>
          {base}
          <path d="M50 76 l0 24 M40 80 l0 20 M60 80 l0 20" stroke={accent} strokeWidth="2" opacity="0.5" />
        </g>
      );
    default:
      return base;
  }
}

/**
 * Gesturing hands, drawn over the torso and animated while speaking.
 * Simple mitten shapes — no individual fingers — so they read cleanly at every
 * size. Only characters with an explicit `gesture` show hands at all.
 */
function Hand({
  x,
  delay,
  gesture,
  skin,
  cuff,
  animate,
}: {
  x: number;
  delay: string;
  gesture: NonNullable<AvatarConfig["gesture"]>;
  skin: string;
  cuff: string;
  animate: boolean;
}) {
  return (
    <g
      className={animate ? "hand-gesture" : undefined}
      style={{ transformOrigin: `${x}px 88px`, animationDelay: delay }}
    >
      <rect x={x - 7} y="88" width="14" height="12" rx="6" fill={cuff} />
      <ellipse cx={x} cy="87" rx="7" ry="7.5" fill={skin} />
      {gesture === "pinch" && (
        <circle cx={x} cy="87" r="3" fill="none" stroke="#00000033" strokeWidth="1.6" />
      )}
      {gesture === "point" && (
        <rect x={x - 2} y="76" width="4.4" height="9" rx="2.2" fill={skin} />
      )}
      {gesture === "open" && (
        <ellipse cx={x} cy="85" rx="7.5" ry="8.5" fill={skin} opacity="0.95" />
      )}
      {gesture === "fist" && (
        <path d={`M${x - 5} 87 h10`} stroke="#00000030" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </g>
  );
}

function Hands({ cfg, speaking }: { cfg: AvatarConfig; speaking: boolean }) {
  const g = cfg.gesture ?? "none";
  if (g === "none") return null;
  return (
    <g>
      <Hand x={26} delay="0s" gesture={g} skin={cfg.skin} cuff={cfg.clothingColor} animate={speaking} />
      <Hand x={74} delay="0.42s" gesture={g} skin={cfg.skin} cuff={cfg.clothingColor} animate={speaking} />
    </g>
  );
}

function RobotFace({ size, speaking, title }: { size: number; speaking: boolean; title: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={title}>
      <rect width="100" height="100" rx="18" fill="#2c3a4a" />
      <rect x="22" y="24" width="56" height="44" rx="10" fill="#8fb7dd" />
      <rect x="28" y="30" width="44" height="32" rx="6" fill="#dcecfa" />
      <circle cx="41" cy="42" r="4.5" fill="#2c3a4a" />
      <circle cx="59" cy="42" r="4.5" fill="#2c3a4a" />
      <rect x="42" y="50" width="16" height="5" rx="2.5" fill="#2c3a4a"
        className={speaking ? "mouth-talk" : undefined} />
      <rect x="44" y="68" width="12" height="6" rx="2" fill="#8fb7dd" />
      <rect x="30" y="74" width="40" height="14" rx="5" fill="#8fb7dd" />
      <circle cx="50" cy="18" r="4" fill={speaking ? "#81b64c" : "#8fb7dd"} />
      <line x1="50" y1="21" x2="50" y2="26" stroke="#8fb7dd" strokeWidth="2.5" />
    </svg>
  );
}

export function CartoonAvatar({
  config,
  name,
  size = 64,
  speaking = false,
  className = "",
  rounded = true,
}: {
  config: AvatarConfig;
  name: string;
  size?: number;
  speaking?: boolean;
  className?: string;
  rounded?: boolean;
}) {
  const cfg = { ...DEFAULT_AVATAR, ...config };
  if (cfg.robot) {
    return (
      <span
        className={`max-w-full ${className}`}
        style={{ display: "inline-flex" }}
      >
        <RobotFace size={size} speaking={speaking} title={`${name} avatar`} />
      </span>
    );
  }
  const mouth = cfg.mouth ?? "smile";
  const brows = cfg.brows ?? "normal";
  const browY = brows === "raised" ? -2 : 0;
  const browTilt = brows === "stern" ? 3 : 0;
  const browWeight = brows === "thick" ? 4 : 2.6;

  return (
    <span
      className={`max-w-full ${className}`}
      style={{ display: "inline-flex" }}
    >
      {/* maxWidth/height:auto let the avatar scale down inside narrow columns
          instead of forcing the layout wider than the screen. */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${name} avatar`}
        style={{ maxWidth: "100%", height: "auto" }}
      >
        {rounded && <rect width="100" height="100" rx="18" fill={cfg.bg ?? "#3a3733"} />}
        {/* torso */}
        <Clothing cfg={cfg} />
        {/* neck */}
        <rect x="43" y="64" width="14" height="14" rx="5" fill={cfg.skin} />
        {/* head */}
        <ellipse cx="50" cy="47" rx="24" ry="26" fill={cfg.skin} />
        {/* ears */}
        {cfg.ears === "large" ? (
          <g fill={cfg.skin}>
            <ellipse cx="24.5" cy="48" rx="5.5" ry="7" />
            <ellipse cx="75.5" cy="48" rx="5.5" ry="7" />
          </g>
        ) : (
          <g fill={cfg.skin}>
            <circle cx="26" cy="49" r="5" />
            <circle cx="74" cy="49" r="5" />
          </g>
        )}
        {/* age lines */}
        {cfg.ageLines && (
          <g stroke="#00000030" strokeWidth="1.6" fill="none">
            <path d="M40 34 q10 -4 20 0" />
            <path d="M33 58 q2 3 5 3 M67 58 q-2 3 -5 3" />
          </g>
        )}
        {cfg.blush && (
          <g fill="#e58b8b" opacity="0.35">
            <ellipse cx="34" cy="55" rx="4.5" ry="2.8" />
            <ellipse cx="66" cy="55" rx="4.5" ry="2.8" />
          </g>
        )}
        {/* brows — exaggerated speakers waggle them while talking */}
        <g
          stroke={cfg.facialHairColor ?? cfg.hairColor}
          strokeWidth={browWeight}
          strokeLinecap="round"
          className={cfg.expressive && speaking ? "brow-waggle" : undefined}
        >
          <line x1="36" y1={41 + browY + browTilt} x2="45" y2={41 + browY} />
          <line x1="55" y1={41 + browY} x2="64" y2={41 + browY + browTilt} />
        </g>
        {/* eyes */}
        <g>
          <circle cx="40.5" cy="47" r="2.6" fill="#2b2420" />
          <circle cx="59.5" cy="47" r="2.6" fill="#2b2420" />
        </g>
        {/* glasses */}
        {cfg.glasses === "square" && (
          <g fill="none" stroke={cfg.glassesColor ?? "#1f1c1a"} strokeWidth="2.2">
            <rect x="33" y="41.5" width="15" height="11" rx="3" />
            <rect x="52" y="41.5" width="15" height="11" rx="3" />
            <line x1="48" y1="46" x2="52" y2="46" />
          </g>
        )}
        {cfg.glasses === "round" && (
          <g fill="none" stroke={cfg.glassesColor ?? "#1f1c1a"} strokeWidth="2.6">
            <circle cx="40.5" cy="47" r="7" />
            <circle cx="59.5" cy="47" r="7" />
            <line x1="47.5" y1="46" x2="52.5" y2="46" />
          </g>
        )}
        {/* nose */}
        <path d="M50 49 q-2.5 5 0 7" stroke="#00000035" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* mouth: static shape when idle, talking ellipse when speaking */}
        {speaking ? (
          <ellipse
            cx="50"
            cy="62"
            rx={cfg.expressive ? 5 : 6.5}
            ry={cfg.expressive ? 6 : 4.5}
            fill="#5b2f2f"
            className="mouth-talk"
          />
        ) : mouth === "grin" && cfg.teeth === "buck" ? (
          <g>
            <path
              d="M37.5 58 L62.5 58 C61.5 72.5 38.5 72.5 37.5 58 Z"
              fill="#5e2b2b"
              stroke="#4a2222"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <rect x="44" y="58" width="5.6" height="8.4" rx="1.4" fill="#ffffff" />
            <rect x="50.4" y="58" width="5.6" height="8.4" rx="1.4" fill="#ffffff" />
          </g>
        ) : mouth === "grin" ? (
          <path d="M41 60 q9 9 18 0 q-4 6 -9 6 q-5 0 -9 -6" fill="#ffffff" stroke="#5b2f2f" strokeWidth="1.4" />
        ) : mouth === "neutral" ? (
          <line x1="43" y1="62" x2="57" y2="62" stroke="#5b2f2f" strokeWidth="2.4" strokeLinecap="round" />
        ) : mouth === "smirk" ? (
          <path d="M43 62 q7 4 14 -1" stroke="#5b2f2f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M42 60.5 q8 7 16 0" stroke="#5b2f2f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        )}
        {/* facial hair over mouth area */}
        <FacialHair cfg={cfg} />
        {/* hair + accessories on top */}
        <Hair cfg={cfg} />
        <TempleGrey cfg={cfg} gradientId={GREY_GRADIENT_ID} />
        <Accessory cfg={cfg} />
        {/* gesturing hands sit in front of everything */}
        <Hands cfg={cfg} speaking={speaking} />
      </svg>
    </span>
  );
}
