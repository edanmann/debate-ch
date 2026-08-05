import { SKILL_KEYS, SKILL_LABELS, type SkillKey } from "@/lib/types";

/** Six-stat visualisations shared by bot cards, profiles and results. */

export function statTone(rating: number): string {
  if (rating >= 85) return "bg-brand";
  if (rating >= 70) return "bg-brand-deep";
  if (rating >= 50) return "bg-warning";
  return "bg-danger";
}

export function SixStatBars({
  stats,
  compare,
  compact = false,
  light = false,
}: {
  stats: Record<SkillKey, number>;
  /** Optional second value rendered as a marker (e.g. opponent). */
  compare?: Record<SkillKey, number>;
  compact?: boolean;
  /** Styling for light "board" surfaces. */
  light?: boolean;
}) {
  return (
    <dl className={`grid gap-${compact ? "1.5" : "2.5"}`}>
      {SKILL_KEYS.map((key) => (
        <div key={key} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-2">
          <dt className={`${compact ? "text-xs" : "text-sm"} ${light ? "text-ink-muted" : "text-fg-muted"}`}>
            {SKILL_LABELS[key]}
          </dt>
          <dd className={`relative h-2 overflow-hidden rounded-full ${light ? "bg-board-2" : "bg-surface-3"}`}>
            <div
              className={`h-full rounded-full ${statTone(stats[key])}`}
              style={{ width: `${stats[key]}%` }}
            />
            {compare && (
              <div
                className="absolute top-0 h-full w-0.5 bg-cream/80"
                style={{ left: `${compare[key]}%` }}
                title={`Opponent: ${compare[key]}`}
              />
            )}
          </dd>
          <dd
            className={`numeric text-right font-semibold ${compact ? "text-xs" : "text-sm"}`}
          >
            {stats[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Original hexagonal radar for the bot profile page. */
export function StatRadar({
  stats,
  size = 220,
}: {
  stats: Record<SkillKey, number>;
  size?: number;
}) {
  const cx = 110;
  const cy = 110;
  const rMax = 82;
  const point = (i: number, value: number) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const r = (value / 100) * rMax;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  };
  const ring = (frac: number) =>
    SKILL_KEYS.map((_, i) => point(i, frac * 100)).join(" ");
  const shape = SKILL_KEYS.map((k, i) => point(i, stats[k])).join(" ");
  const labelPos = (i: number) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return {
      x: cx + (rMax + 18) * Math.cos(angle),
      y: cy + (rMax + 18) * Math.sin(angle) + 4,
    };
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      role="img"
      aria-label={`Skill radar: ${SKILL_KEYS.map((k) => `${SKILL_LABELS[k]} ${stats[k]}`).join(", ")}`}
    >
      {[0.33, 0.66, 1].map((f) => (
        <polygon
          key={f}
          points={ring(f)}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />
      ))}
      <polygon
        points={shape}
        fill="var(--brand)"
        fillOpacity="0.25"
        stroke="var(--brand)"
        strokeWidth="2"
      />
      {SKILL_KEYS.map((k, i) => {
        const p = labelPos(i);
        return (
          <text
            key={k}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            fontSize="9"
            fill="var(--text-secondary)"
          >
            {SKILL_LABELS[k].slice(0, 4).toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}
