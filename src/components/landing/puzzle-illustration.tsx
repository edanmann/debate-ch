/**
 * Puzzles-section illustration.
 *
 * An isometric ladder of tiles climbing from left to right, each carrying a
 * debate skill, with the next rung lit. It shows what puzzles are *for* — a
 * progression you climb — rather than showing one puzzle, which people read as
 * "that is what every puzzle looks like".
 *
 * It sits on the same light board panel as every other section visual, so it
 * belongs to the page rather than floating on the background.
 */

const TILE_W = 92;
const TILE_H = 52;

interface Tile {
  cx: number;
  cy: number;
  /** Extruded side. */
  fill: string;
  /** Top face. */
  top: string;
  icon: "mic" | "bubble" | "bang" | "query" | "scales" | "crown";
  label: string;
}

// One step up-right is (+50, -28): a half-tile in each axis plus a small gap,
// so the diamonds line up edge to edge instead of overlapping. The greens
// ascend with the climb, so difficulty reads even in greyscale.
const LADDER: Tile[] = [
  { cx: 96, cy: 236, fill: "#a9bd97", top: "#c6d6b6", icon: "bubble", label: "Framing" },
  { cx: 146, cy: 208, fill: "#9ab884", top: "#b8d2a1", icon: "query", label: "Clash" },
  { cx: 196, cy: 180, fill: "#8bb46f", top: "#a9cd8a", icon: "scales", label: "Weighing" },
  { cx: 246, cy: 152, fill: "#7cae59", top: "#9bc973", icon: "bang", label: "Rebuttal" },
  { cx: 296, cy: 124, fill: "#5f9a37", top: "#8ede63", icon: "mic", label: "Today" },
];

/** One tile off the line, so the composition isn't a perfect diagonal. */
const OFFSHOOT: Tile = {
  cx: 146,
  cy: 264,
  fill: "#b4c5a3",
  top: "#cddcbe",
  icon: "crown",
  label: "Mastery",
};

function Icon({ kind, x, y }: { kind: Tile["icon"]; x: number; y: number }) {
  const p = { fill: "#ffffff", opacity: 0.95 };
  switch (kind) {
    case "mic":
      return (
        <g transform={`translate(${x - 10} ${y - 14})`} {...p}>
          <rect x="6" y="0" width="9" height="15" rx="4.5" />
          <path d="M1.5 11 a9 9 0 0 0 18 0 h-2.8 a6.2 6.2 0 0 1 -12.4 0 z" />
          <rect x="9" y="20" width="3" height="6" rx="1.5" />
          <rect x="4" y="25" width="13" height="2.8" rx="1.4" />
        </g>
      );
    case "bubble":
      return (
        <g transform={`translate(${x - 12} ${y - 10})`} {...p}>
          <rect x="0" y="0" width="24" height="16" rx="4.5" />
          <path d="M4.5 14 L4.5 22 L12 15 Z" />
        </g>
      );
    case "bang":
      return (
        <g transform={`translate(${x - 8} ${y - 12})`} {...p}>
          <rect x="0" y="0" width="5.4" height="15" rx="2.7" />
          <rect x="0" y="18" width="5.4" height="5.4" rx="2.7" />
          <rect x="10.6" y="0" width="5.4" height="15" rx="2.7" />
          <rect x="10.6" y="18" width="5.4" height="5.4" rx="2.7" />
        </g>
      );
    case "query":
      return (
        <g transform={`translate(${x - 8} ${y - 12})`} {...p}>
          <path d="M0.5 5.5 a6.5 6.5 0 0 1 12 2.8 c0 3.7 -3.7 4.6 -3.7 7.4 h-4.6 c0 -4.6 3.7 -5.5 3.7 -7.4 a2.3 2.3 0 0 0 -4.2 -1.4 z" />
          <rect x="4" y="18.5" width="5" height="5" rx="2.5" />
        </g>
      );
    case "scales":
      return (
        <g transform={`translate(${x - 13} ${y - 12})`} {...p}>
          <rect x="11.6" y="2" width="2.8" height="20" rx="1.4" />
          <rect x="3.5" y="22" width="19" height="2.8" rx="1.4" />
          <rect x="1.5" y="5.5" width="23" height="2.4" rx="1.2" />
          <path d="M1.5 7.5 L6.6 15.6 h-10.2 z" />
          <path d="M24.5 7.5 L29.6 15.6 h-10.2 z" />
        </g>
      );
    case "crown":
      return (
        <g transform={`translate(${x - 12} ${y - 9})`} {...p}>
          <path d="M0 3.5 L5.5 11 L12 1 L18.5 11 L24 3.5 L21.5 18 h-19 z" />
        </g>
      );
  }
}

/** An isometric slab: lit top face plus an extruded side. */
function Diamond({ tile }: { tile: Tile }) {
  const { cx, cy } = tile;
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  const depth = 11;
  const top = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  return (
    <g>
      <path
        d={`M${cx - hw} ${cy} L${cx} ${cy + hh} L${cx + hw} ${cy} L${cx + hw} ${cy + depth} L${cx} ${cy + hh + depth} L${cx - hw} ${cy + depth} Z`}
        fill={tile.fill}
      />
      <polygon points={top} fill={tile.top} />
      <Icon kind={tile.icon} x={cx} y={cy} />
    </g>
  );
}

export default function PuzzleIllustration() {
  const lit = LADDER[LADDER.length - 1];
  return (
    <div className="rounded-3xl bg-board p-4 text-ink shadow-2xl ring-1 ring-black/10 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
          Today&apos;s puzzles
        </p>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-black shadow-sm">
          🔥 12-day streak
        </span>
      </div>

      <svg viewBox="40 62 316 226" className="h-auto w-full" role="presentation" aria-hidden>
        <defs>
          <radialGradient id="puzzle-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#81b64c" stopOpacity="0.3" />
            <stop offset="0.55" stopColor="#81b64c" stopOpacity="0.1" />
            <stop offset="1" stopColor="#81b64c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={lit.cx} cy={lit.cy} r="88" fill="url(#puzzle-halo)" />

        {/* Rungs connecting the climb, drawn under the tiles. */}
        <g stroke="#2b2a27" strokeOpacity="0.16" strokeWidth="2" strokeDasharray="4 6">
          {LADDER.slice(0, -1).map((tile, i) => (
            <path
              key={tile.label}
              d={`M${tile.cx} ${tile.cy} L${LADDER[i + 1].cx} ${LADDER[i + 1].cy}`}
              fill="none"
            />
          ))}
        </g>

        <Diamond tile={OFFSHOOT} />
        {LADDER.map((tile) => (
          <Diamond key={tile.label} tile={tile} />
        ))}

        {/* Only the rung you're on is named, so the art stays uncluttered. */}
        <g transform={`translate(${lit.cx} ${lit.cy - 50})`}>
          <rect x="-44" y="-13" width="88" height="26" rx="13" fill="#ffffff" />
          <text
            x="0"
            y="1"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12.5"
            fontWeight="900"
            fill="#2b2a27"
          >
            Speak now
          </text>
        </g>
      </svg>

      <div className="flex items-center justify-between gap-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-8 rounded-full bg-[#81b64c]" />
          <span className="h-2 w-8 rounded-full bg-[#81b64c]" />
          <span className="h-2 w-8 rounded-full bg-[#dedcd3]" />
        </span>
        <p className="text-[11px] font-bold text-ink-muted">2 of 3 done today</p>
      </div>
    </div>
  );
}
