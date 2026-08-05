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
    | "swoop"
    | "side-part"
    | "curly"
    | "bun"
    | "dreads"
    | "long"
    | "bob"
    | "bouffant"
    | "ponytail"
    | "wild"
    | "afro"
    | "slick-back"
    | "receding";
  hairColor: string;
  facialHair?: "none" | "mustache" | "beard" | "full" | "goatee" | "stubble";
  facialHairColor?: string;
  glasses?: "none" | "square" | "round";
  brows?: "normal" | "stern" | "raised";
  mouth?: "smile" | "grin" | "neutral" | "smirk";
  clothing: "suit" | "turtleneck" | "hoodie" | "jersey" | "sweater" | "shirt" | "tshirt" | "robe";
  clothingColor: string;
  clothingAccent?: string;
  accessory?: "none" | "wig" | "cat-ears" | "headphones" | "cap" | "pearls" | "headband";
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

function Hair({ cfg }: { cfg: AvatarConfig }) {
  const c = cfg.hairColor;
  switch (cfg.hair) {
    case "none":
      return null;
    case "bald-fringe":
      return (
        <path d="M24 44 q0 -10 6 -14 q-2 8 2 10 l0 6 q-5 2 -8 -2 M76 44 q0 -10 -6 -14 q2 8 -2 10 l0 6 q5 2 8 -2" fill={c} />
      );
    case "receding":
      return (
        <path d="M26 40 q-1 -16 24 -17 q25 1 24 17 q-1 -8 -10 -9 q-4 -2 -14 -2 q-10 0 -14 2 q-9 1 -10 9" fill={c} />
      );
    case "short":
      return <path d="M25 42 q-2 -20 25 -20 q27 0 25 20 q-2 -9 -8 -11 q-8 -4 -17 -4 q-9 0 -17 4 q-6 2 -8 11" fill={c} />;
    case "crew":
      return <path d="M26 38 q0 -15 24 -15 q24 0 24 15 l-2 4 q-4 -10 -22 -10 q-18 0 -22 10 z" fill={c} />;
    case "swoop":
      return (
        <path d="M24 40 q-3 -18 26 -19 q22 -1 26 12 q1 6 -2 9 q1 -8 -8 -9 q-22 -3 -30 2 q-8 4 -6 12 q-5 -1 -6 -7" fill={c} />
      );
    case "side-part":
      return (
        <path d="M25 42 q-2 -19 25 -19 q26 0 25 18 q-1 -8 -12 -10 q3 4 1 6 q-14 -8 -30 -3 q-7 3 -9 8" fill={c} />
      );
    case "curly":
      return (
        <g fill={c}>
          <circle cx="32" cy="32" r="8" /><circle cx="42" cy="27" r="8" />
          <circle cx="52" cy="26" r="8" /><circle cx="62" cy="28" r="8" />
          <circle cx="69" cy="34" r="7" /><circle cx="27" cy="40" r="6" />
          <circle cx="73" cy="42" r="6" />
        </g>
      );
    case "bun":
      return (
        <g fill={c}>
          <circle cx="50" cy="20" r="8" />
          <path d="M26 42 q-2 -18 24 -18 q26 0 24 18 q-4 -12 -24 -12 q-20 0 -24 12" />
        </g>
      );
    case "dreads":
      return (
        <g fill={c}>
          <path d="M26 42 q-2 -18 24 -18 q26 0 24 18 q-4 -11 -24 -11 q-20 0 -24 11" />
          <rect x="24" y="36" width="5" height="14" rx="2.5" />
          <rect x="31" y="30" width="5" height="12" rx="2.5" />
          <rect x="64" y="30" width="5" height="12" rx="2.5" />
          <rect x="71" y="36" width="5" height="14" rx="2.5" />
        </g>
      );
    case "long":
      return (
        <path d="M24 70 l0 -28 q0 -18 26 -18 q26 0 26 18 l0 28 q-6 4 -12 2 l0 -26 q-14 -6 -28 0 l0 26 q-6 2 -12 -2" fill={c} />
      );
    case "bob":
      return (
        <path d="M24 60 q-4 -34 26 -35 q30 1 26 35 l-8 2 q2 -18 -4 -24 q-14 -6 -28 0 q-6 6 -4 24 z" fill={c} />
      );
    case "bouffant":
      return (
        <path d="M23 48 q-6 -26 27 -27 q33 1 27 27 q-3 3 -6 2 q3 -16 -7 -19 q-14 -5 -28 0 q-10 3 -7 19 q-3 1 -6 -2" fill={c} />
      );
    case "ponytail":
      return (
        <g fill={c}>
          <path d="M25 44 q-2 -20 25 -20 q27 0 25 20 q-3 -11 -25 -11 q-22 0 -25 11" />
          <path d="M70 34 q12 6 8 26 q-3 10 -8 12 q4 -12 2 -22 q-1 -8 -6 -12 z" />
        </g>
      );
    case "wild":
      return (
        <g fill={c}>
          <path d="M26 44 q-8 -24 24 -22 q34 -2 24 24 q-4 -12 -24 -12 q-18 0 -24 10" />
          <path d="M22 36 l-6 -8 6 2 -2 -8 6 6 0 -8 5 8z" />
          <path d="M78 36 l6 -8 -6 2 2 -8 -6 6 0 -8 -5 8z" />
        </g>
      );
    case "afro":
      return <circle cx="50" cy="34" r="22" fill={c} />;
    case "slick-back":
      return <path d="M25 40 q-1 -17 25 -17 q26 0 25 17 q-2 -10 -25 -10 q-23 0 -25 10" fill={c} />;
    default:
      return null;
  }
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
        <circle cx="26" cy="49" r="5" fill={cfg.skin} />
        <circle cx="74" cy="49" r="5" fill={cfg.skin} />
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
          strokeWidth="2.6"
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
          <g fill="none" stroke="#1f1c1a" strokeWidth="2.2">
            <rect x="33" y="41.5" width="15" height="11" rx="3" />
            <rect x="52" y="41.5" width="15" height="11" rx="3" />
            <line x1="48" y1="46" x2="52" y2="46" />
          </g>
        )}
        {cfg.glasses === "round" && (
          <g fill="none" stroke="#1f1c1a" strokeWidth="2.2">
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
        <Accessory cfg={cfg} />
        {/* gesturing hands sit in front of everything */}
        <Hands cfg={cfg} speaking={speaking} />
      </svg>
    </span>
  );
}
