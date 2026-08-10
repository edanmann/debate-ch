/**
 * Puzzles-section illustration.
 *
 * An isometric ladder of tiles climbing from left to right, each carrying a
 * debate skill, with the next rung lit. It shows what puzzles are *for* — a
 * progression you climb — rather than showing one puzzle, which people read as
 * "that is what every puzzle looks like".
 *
 * Deliberately free of buttons, chips and progress bars: it is a picture, and
 * nothing in it should invite a click it cannot answer.
 */

const TILE_W = 76;
const TILE_H = 42;
const DEPTH = 9;

interface Tile {
  cx: number;
  cy: number;
  /** Extruded side. */
  side: string;
  /** Top face. */
  top: string;
  icon: "mic" | "bubble" | "bang" | "query" | "scales";
  label: string;
}

// One step up-right is (+54, -30) against a half-tile of (38, 21), which
// leaves a clear gap on every side — the tiles read as separate slabs rather
// than one interpenetrating mass.
const LADDER: Tile[] = [
  { cx: 86, cy: 250, side: "#a7bb95", top: "#c8d8b8", icon: "bubble", label: "Framing" },
  { cx: 140, cy: 220, side: "#98b681", top: "#bad4a3", icon: "query", label: "Clash" },
  { cx: 194, cy: 190, side: "#89b26c", top: "#abcf8c", icon: "scales", label: "Weighing" },
  { cx: 248, cy: 160, side: "#79ac56", top: "#9dcb75", icon: "bang", label: "Rebuttal" },
  { cx: 302, cy: 130, side: "#5c9834", top: "#90e065", icon: "mic", label: "Speaking" },
];

function Icon({ kind, x, y }: { kind: Tile["icon"]; x: number; y: number }) {
  const p = { fill: "#ffffff", opacity: 0.95 };
  switch (kind) {
    case "mic":
      return (
        <g transform={`translate(${x - 8.5} ${y - 12})`} {...p}>
          <rect x="5" y="0" width="7.5" height="12.5" rx="3.75" />
          <path d="M1.2 9.2 a7.5 7.5 0 0 0 15 0 h-2.3 a5.2 5.2 0 0 1 -10.4 0 z" />
          <rect x="7.4" y="16.8" width="2.6" height="5" rx="1.3" />
          <rect x="3.4" y="21" width="10.6" height="2.4" rx="1.2" />
        </g>
      );
    case "bubble":
      return (
        <g transform={`translate(${x - 10} ${y - 8.5})`} {...p}>
          <rect x="0" y="0" width="20" height="13.5" rx="4" />
          <path d="M3.8 11.8 L3.8 18.5 L10 12.6 Z" />
        </g>
      );
    case "bang":
      return (
        <g transform={`translate(${x - 6.6} ${y - 10})`} {...p}>
          <rect x="0" y="0" width="4.5" height="12.5" rx="2.25" />
          <rect x="0" y="15" width="4.5" height="4.5" rx="2.25" />
          <rect x="8.8" y="0" width="4.5" height="12.5" rx="2.25" />
          <rect x="8.8" y="15" width="4.5" height="4.5" rx="2.25" />
        </g>
      );
    case "query":
      return (
        <g transform={`translate(${x - 6.5} ${y - 10})`} {...p}>
          <path d="M0.4 4.6 a5.4 5.4 0 0 1 10 2.3 c0 3.1 -3.1 3.8 -3.1 6.2 h-3.8 c0 -3.8 3.1 -4.6 3.1 -6.2 a1.9 1.9 0 0 0 -3.5 -1.2 z" />
          <rect x="3.3" y="15.4" width="4.2" height="4.2" rx="2.1" />
        </g>
      );
    case "scales":
      return (
        <g transform={`translate(${x - 10.8} ${y - 10})`} {...p}>
          <rect x="9.7" y="1.7" width="2.3" height="16.6" rx="1.15" />
          <rect x="2.9" y="18.3" width="15.8" height="2.3" rx="1.15" />
          <rect x="1.2" y="4.6" width="19.2" height="2" rx="1" />
          <path d="M1.2 6.2 L5.5 13 h-8.6 z" />
          <path d="M20.4 6.2 L24.7 13 h-8.6 z" />
        </g>
      );
  }
}

/** An isometric slab: lit top face plus an extruded side. */
function Diamond({ tile }: { tile: Tile }) {
  const { cx, cy } = tile;
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  const top = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  return (
    <g>
      <path
        d={`M${cx - hw} ${cy} L${cx} ${cy + hh} L${cx + hw} ${cy} L${cx + hw} ${cy + DEPTH} L${cx} ${cy + hh + DEPTH} L${cx - hw} ${cy + DEPTH} Z`}
        fill={tile.side}
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
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
          Daily puzzles
        </p>
        <p className="text-[11px] font-semibold text-ink-muted">Three a day</p>
      </div>

      <svg viewBox="28 58 348 214" className="h-auto w-full" role="presentation" aria-hidden>
        <defs>
          <radialGradient id="puzzle-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#81b64c" stopOpacity="0.32" />
            <stop offset="0.55" stopColor="#81b64c" stopOpacity="0.1" />
            <stop offset="1" stopColor="#81b64c" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Radius kept inside the frame on every side — a clipped radial reads
            as a soft square, which is worse than no glow at all. */}
        <circle cx={lit.cx} cy={lit.cy + 4} r="52" fill="url(#puzzle-halo)" />

        {/* Rungs connecting the climb, drawn under the tiles. */}
        <g stroke="#2b2a27" strokeOpacity="0.14" strokeWidth="2" strokeDasharray="3 6">
          {LADDER.slice(0, -1).map((tile, i) => (
            <path
              key={tile.label}
              d={`M${tile.cx} ${tile.cy} L${LADDER[i + 1].cx} ${LADDER[i + 1].cy}`}
              fill="none"
            />
          ))}
        </g>

        {LADDER.map((tile) => (
          <Diamond key={tile.label} tile={tile} />
        ))}

      </svg>
    </div>
  );
}
