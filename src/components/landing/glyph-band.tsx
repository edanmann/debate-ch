/**
 * Decorative glyph band that closes the page.
 *
 * Three offset rows of debate marks — speech bubbles, the `!!`/`??`/`!?`
 * annotations used on the analysis cards, and quote marks — drifting slowly in
 * alternating directions. Purely ornamental, so it is hidden from assistive
 * tech and holds still for anyone who asks for reduced motion.
 */

const INK = "#1b1a18";
const PAPER = "#eae7e0";

const C = {
  orange: "#ee6c3a",
  teal: "#2ab7a9",
  green: "#6aa84f",
  brand: "#81b64c",
  yellow: "#e9b526",
  red: "#d64545",
  purple: "#7b61e0",
  blue: "#3b8ede",
  paper: PAPER,
  grey: "#9a9691",
  deepRed: "#a13b3b",
  deepGreen: "#4f8a3c",
  ochre: "#b58a1e",
} as const;

type Color = (typeof C)[keyof typeof C];

/** Light fills need dark marks; saturated ones need white. */
function markOn(fill: Color): string {
  return fill === C.yellow || fill === C.paper ? INK : "#ffffff";
}

function Circle({ fill, label }: { fill: Color; label: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-auto">
      <circle cx="32" cy="32" r="30" fill={fill} />
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="27"
        fontWeight="900"
        fill={markOn(fill)}
        letterSpacing="-1"
      >
        {label}
      </text>
    </svg>
  );
}

function Square({ fill, label }: { fill: Color; label: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-auto">
      <rect x="2" y="2" width="60" height="60" rx="18" fill={fill} />
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={label === "•••" ? 26 : 34}
        fontWeight="900"
        fill={markOn(fill)}
        letterSpacing={label === "•••" ? "1" : "-1"}
      >
        {label}
      </text>
    </svg>
  );
}

/** The paired bubbles from the wordmark: one speaking, one answering. */
function Bubbles({ fill }: { fill: Color }) {
  const dots = markOn(fill);
  return (
    <svg viewBox="0 0 82 64" className="h-full w-auto">
      {/* the reply, sitting behind and to the right */}
      <rect x="42" y="20" width="38" height="30" rx="9" fill={PAPER} />
      <path d="M72 47 L72 62 L58 49 Z" fill={PAPER} />
      {/* the opening line, in front */}
      <rect x="2" y="4" width="48" height="36" rx="10" fill={fill} />
      <path d="M10 37 L10 54 L26 40 Z" fill={fill} />
      <g fill={dots}>
        <circle cx="16" cy="22" r="3.6" />
        <circle cx="26" cy="22" r="3.6" />
        <circle cx="36" cy="22" r="3.6" />
      </g>
    </svg>
  );
}

function Quote({ fill, flip = false }: { fill: Color; flip?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-auto">
      <g
        fill={fill}
        transform={flip ? "rotate(180 32 32)" : undefined}
      >
        <path d="M14 18 h16 v14 q0 12 -13 16 l-3 -6 q7 -3 7 -8 h-7 z" />
        <path d="M36 18 h16 v14 q0 12 -13 16 l-3 -6 q7 -3 7 -8 h-7 z" />
      </g>
    </svg>
  );
}

type Tile =
  | { kind: "circle" | "square"; fill: Color; label: string }
  | { kind: "bubbles"; fill: Color }
  | { kind: "quote"; fill: Color; flip?: boolean };

const ROWS: Tile[][] = [
  [
    { kind: "circle", fill: C.orange, label: "??" },
    { kind: "circle", fill: C.teal, label: "!!" },
    { kind: "bubbles", fill: C.brand },
    { kind: "quote", fill: C.yellow },
    { kind: "circle", fill: C.red, label: "??" },
    { kind: "bubbles", fill: C.orange },
    { kind: "circle", fill: C.purple, label: "!?" },
    { kind: "square", fill: C.purple, label: "•••" },
    { kind: "quote", fill: C.paper, flip: true },
  ],
  [
    { kind: "bubbles", fill: C.paper },
    { kind: "circle", fill: C.blue, label: "!!" },
    { kind: "square", fill: C.yellow, label: "!" },
    { kind: "bubbles", fill: C.green },
    { kind: "square", fill: C.teal, label: "•••" },
    { kind: "quote", fill: C.purple },
    { kind: "circle", fill: C.teal, label: "!?" },
    { kind: "square", fill: C.orange, label: "!" },
  ],
  [
    { kind: "bubbles", fill: C.ochre },
    { kind: "circle", fill: C.deepRed, label: "!!" },
    { kind: "bubbles", fill: C.grey },
    { kind: "square", fill: C.deepGreen, label: "!" },
    { kind: "circle", fill: C.purple, label: "??" },
    { kind: "bubbles", fill: C.brand },
    { kind: "quote", fill: C.teal, flip: true },
    { kind: "square", fill: C.red, label: "•••" },
  ],
];

function Glyph({ tile }: { tile: Tile }) {
  if (tile.kind === "bubbles") return <Bubbles fill={tile.fill} />;
  if (tile.kind === "quote") return <Quote fill={tile.fill} flip={tile.flip} />;
  if (tile.kind === "circle") return <Circle fill={tile.fill} label={tile.label} />;
  return <Square fill={tile.fill} label={tile.label} />;
}

export default function GlyphBand() {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative select-none overflow-hidden py-10 [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_70%,transparent)]"
    >
      <div className="flex flex-col gap-7 sm:gap-9">
        {ROWS.map((row, i) => (
          <div
            key={i}
            // Duplicated once so translating by half the width loops seamlessly.
            className={`flex w-max shrink-0 items-center gap-7 sm:gap-9 ${
              i % 2 === 1 ? "glyph-drift-alt" : "glyph-drift"
            }`}
            style={{ marginLeft: `${i * -3}rem` }}
          >
            {[...row, ...row].map((tile, j) => (
              <span key={j} className="block h-11 shrink-0 sm:h-14">
                <Glyph tile={tile} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
