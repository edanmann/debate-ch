/**
 * Puzzles-section illustration.
 *
 * An isometric ladder of tiles climbing from left to right, each carrying a
 * debate skill, with the next one up lit. It shows what puzzles are *for* —
 * a progression you climb — rather than showing one puzzle, which people read
 * as "that is what every puzzle looks like".
 */

const TILE_W = 96;
const TILE_H = 54;

interface Tile {
  /** Grid position; x runs right, y runs down the ladder. */
  cx: number;
  cy: number;
  fill: string;
  glow?: boolean;
  dim?: boolean;
  icon: "mic" | "bubble" | "bang" | "query" | "scales" | "crown";
}

// Positions sit on the isometric lattice: one step up-right is (+52, -29),
// which is a half-tile in each axis plus a small gap, so the diamonds line up
// edge to edge instead of overlapping.
const TILES: Tile[] = [
  { cx: 170, cy: 323, fill: "#2f4a38", dim: true, icon: "crown" },
  { cx: 118, cy: 296, fill: "#33513c", dim: true, icon: "bubble" },
  { cx: 170, cy: 267, fill: "#3d6b48", dim: true, icon: "query" },
  { cx: 222, cy: 238, fill: "#478053", icon: "scales" },
  { cx: 274, cy: 209, fill: "#4e8f5c", icon: "bang" },
  { cx: 326, cy: 180, fill: "#7ee2b0", glow: true, icon: "mic" },
];

function Icon({ kind, x, y }: { kind: Tile["icon"]; x: number; y: number }) {
  const common = { fill: "#ffffff", opacity: 0.92 };
  switch (kind) {
    case "mic":
      return (
        <g transform={`translate(${x - 11} ${y - 15})`} {...common}>
          <rect x="7" y="0" width="10" height="16" rx="5" />
          <path d="M2 12 a10 10 0 0 0 20 0 h-3 a7 7 0 0 1 -14 0 z" />
          <rect x="10.5" y="22" width="3" height="7" rx="1.5" />
          <rect x="5" y="28" width="14" height="3" rx="1.5" />
        </g>
      );
    case "bubble":
      return (
        <g transform={`translate(${x - 13} ${y - 11})`} {...common}>
          <rect x="0" y="0" width="26" height="18" rx="5" />
          <path d="M5 16 L5 25 L13 17 Z" />
        </g>
      );
    case "bang":
      return (
        <g transform={`translate(${x - 9} ${y - 13})`} {...common}>
          <rect x="0" y="0" width="6" height="17" rx="3" />
          <rect x="0" y="20" width="6" height="6" rx="3" />
          <rect x="12" y="0" width="6" height="17" rx="3" />
          <rect x="12" y="20" width="6" height="6" rx="3" />
        </g>
      );
    case "query":
      return (
        <g transform={`translate(${x - 9} ${y - 13})`} {...common}>
          <path d="M1 6 a7 7 0 0 1 13 3 c0 4 -4 5 -4 8 h-5 c0 -5 4 -6 4 -8 a2.5 2.5 0 0 0 -4.5 -1.5 z" />
          <rect x="4.5" y="20" width="5.5" height="5.5" rx="2.75" />
        </g>
      );
    case "scales":
      return (
        <g transform={`translate(${x - 14} ${y - 13})`} {...common}>
          <rect x="12.5" y="2" width="3" height="22" rx="1.5" />
          <rect x="4" y="24" width="20" height="3" rx="1.5" />
          <rect x="2" y="6" width="24" height="2.6" rx="1.3" />
          <path d="M2 8 L7.5 17 h-11 z" />
          <path d="M26 8 L31.5 17 h-11 z" />
        </g>
      );
    case "crown":
      return (
        <g transform={`translate(${x - 13} ${y - 10})`} {...common}>
          <path d="M0 4 L6 12 L13 1 L20 12 L26 4 L23 20 h-20 z" />
        </g>
      );
  }
}

/** One isometric diamond with its extruded side, drawn as a flat rhombus. */
function Diamond({ tile }: { tile: Tile }) {
  const { cx, cy, fill } = tile;
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  const depth = 12;
  const top = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  return (
    <g opacity={tile.dim ? 0.72 : 1}>
      {/* extruded side, so the tile reads as a solid slab */}
      <path
        d={`M${cx - hw} ${cy} L${cx} ${cy + hh} L${cx + hw} ${cy} L${cx + hw} ${cy + depth} L${cx} ${cy + hh + depth} L${cx - hw} ${cy + depth} Z`}
        fill={fill}
        opacity="0.55"
      />
      <polygon points={top} fill={fill} />
      <Icon kind={tile.icon} x={cx} y={cy} />
    </g>
  );
}

export default function PuzzleIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[19rem]" aria-hidden>
      <svg viewBox="52 52 400 336" className="h-auto w-full" role="presentation">
        <defs>
          <radialGradient id="puzzle-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#7ee2b0" stopOpacity="0.34" />
            <stop offset="0.55" stopColor="#7ee2b0" stopOpacity="0.12" />
            <stop offset="1" stopColor="#7ee2b0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="326" cy="180" r="118" fill="url(#puzzle-halo)" />

        {/* Rungs connecting the climb, drawn under the tiles. */}
        <g stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="4 6">
          <path d="M118 296 L170 267" fill="none" />
          <path d="M170 267 L222 238" fill="none" />
          <path d="M222 238 L274 209" fill="none" />
          <path d="M274 209 L326 180" fill="none" />
        </g>

        {TILES.map((tile) => (
          <Diamond key={`${tile.cx}-${tile.cy}`} tile={tile} />
        ))}

        {/* Streak counter riding along with the climb. */}
        <g transform="translate(62 96)">
          <rect x="0" y="0" width="118" height="46" rx="14" fill="#f4f3ee" />
          <text x="16" y="20" fontSize="10" fontWeight="800" fill="#6b6963">
            DAY STREAK
          </text>
          <text x="16" y="38" fontSize="17" fontWeight="900" fill="#2b2a27">
            🔥 12 days
          </text>
        </g>
      </svg>
    </div>
  );
}
