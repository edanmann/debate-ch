/**
 * Chess.com-style move-quality badges for speeches:
 * !! brilliant rebuttal · ! great point · ?! inaccuracy · ?? blunder.
 */

export type SpeechVerdict =
  | "brilliant"
  | "great"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder";

const STYLES: Record<SpeechVerdict, { mark: string; bg: string; label: string }> = {
  brilliant: { mark: "!!", bg: "#26c2a3", label: "Brilliant rebuttal" },
  great: { mark: "!", bg: "#4fa8e0", label: "Great point" },
  good: { mark: "✓", bg: "#7aa64f", label: "Solid point" },
  inaccuracy: { mark: "?!", bg: "#e0a03d", label: "Inaccuracy" },
  mistake: { mark: "?", bg: "#e08c3d", label: "Mistake" },
  blunder: { mark: "??", bg: "#e0614f", label: "Blunder" },
};

export function MoveBadge({
  verdict,
  size = "md",
  withLabel = false,
}: {
  verdict: SpeechVerdict;
  size?: "sm" | "md" | "lg";
  withLabel?: boolean;
}) {
  const s = STYLES[verdict];
  const dims =
    size === "lg" ? "h-9 w-9 text-lg" : size === "sm" ? "h-5 w-5 text-[10px]" : "h-7 w-7 text-sm";
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      <span
        className={`grid ${dims} shrink-0 place-items-center rounded-full font-black text-white shadow-md`}
        style={{ backgroundColor: s.bg }}
        aria-label={s.label}
        title={s.label}
      >
        {s.mark}
      </span>
      {withLabel && (
        <span className="text-xs font-bold" style={{ color: s.bg }}>
          {s.label}
        </span>
      )}
    </span>
  );
}
