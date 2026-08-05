/**
 * Original bot emblems — deterministic geometric SVG generated from the slug.
 * Deliberately non-photorealistic and non-likeness-based: real-person bots are
 * represented by abstract marks plus their name,
 * never by portraits (spec §16). Illustrated 2D character art can replace
 * these behind the same component contract.
 */

const PALETTES: [string, string][] = [
  ["#81b64c", "#4a6b2a"],
  ["#769656", "#3d5230"],
  ["#e3a83d", "#8a6420"],
  ["#64a8dc", "#2f5d82"],
  ["#b07fd6", "#5f4180"],
  ["#e0614f", "#8a352a"],
  ["#5bc9b1", "#2c6e60"],
  ["#d6b25f", "#7d6430"],
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function initials(name: string): string {
  const parts = name.replace(/^The\s+/i, "").split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function BotEmblem({
  name,
  seed,
  size = 48,
  className = "",
  speaking = false,
}: {
  name: string;
  seed: string;
  size?: number;
  className?: string;
  speaking?: boolean;
}) {
  const h = hash(seed);
  const [c1, c2] = PALETTES[h % PALETTES.length];
  const shape = h % 3;
  const rot = (h >> 4) % 360;
  const id = `g-${seed.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${name} emblem`}
      className={`${speaking ? "speaking-pulse" : ""} ${className}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="62" height="62" rx="16" fill={`url(#${id})`} />
      <g transform={`rotate(${rot} 32 32)`} opacity="0.35">
        {shape === 0 && <circle cx="44" cy="20" r="18" fill="#ffffff" />}
        {shape === 1 && (
          <path d="M10 54 L32 8 L54 54 Z" fill="#ffffff" />
        )}
        {shape === 2 && (
          <rect x="26" y="-6" width="40" height="40" rx="10" fill="#ffffff" />
        )}
      </g>
      <text
        x="32"
        y="39"
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fill="#ffffff"
        fontFamily="inherit"
      >
        {initials(name)}
      </text>
    </svg>
  );
}

export function UserEmblem({
  name,
  size = 48,
  className = "",
  speaking = false,
}: {
  name: string;
  size?: number;
  className?: string;
  speaking?: boolean;
}) {
  return (
    <BotEmblem
      name={name || "You"}
      seed={`user:${name}`}
      size={size}
      className={className}
      speaking={speaking}
    />
  );
}
