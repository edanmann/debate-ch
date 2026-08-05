/**
 * Colourful flat icon set — the app's "alive" layer (chess.com-style
 * multi-colour glyphs, original artwork). All 24×24 fill-based.
 */

function Svg({
  children,
  className = "h-6 w-6",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {children}
    </svg>
  );
}

type IconProps = { className?: string };

/** Brand mark: two speech bubbles in debate. */
export function LogoMark({ className = "h-8 w-8" }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M3 5.5A2.5 2.5 0 015.5 3h8A2.5 2.5 0 0116 5.5v5a2.5 2.5 0 01-2.5 2.5H8l-3.4 3V13A2.5 2.5 0 013 10.5z"
        fill="#81b64c"
      />
      <path
        d="M17.5 8H17v2.5a4 4 0 01-4 4h-2v.5A2.5 2.5 0 0113.5 17H17l3.2 2.8V17A2.5 2.5 0 0021 14.5v-4A2.5 2.5 0 0018.5 8z"
        fill="#eeeed2"
      />
      <circle cx="6.8" cy="8" r="1.1" fill="#22301a" />
      <circle cx="9.7" cy="8" r="1.1" fill="#22301a" />
      <circle cx="12.6" cy="8" r="1.1" fill="#22301a" />
    </Svg>
  );
}

export function DebateColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      {/* Lectern with a raised hand — reads as "take the floor", and is
          visually distinct from the speech-bubble brand mark used for Home. */}
      <path d="M6 20h12l-1.4-9H7.4z" fill="#c98d4e" />
      <rect x="10.4" y="7.5" width="3.2" height="4" rx="1.2" fill="#a2703f" />
      <rect x="4.5" y="19.4" width="15" height="2.4" rx="1.2" fill="#8a5a34" />
      <path d="M12 2.6a2.6 2.6 0 012.6 2.6V8h-5.2V5.2A2.6 2.6 0 0112 2.6z" fill="#81b64c" />
      <rect x="8.2" y="12.4" width="7.6" height="1.6" rx="0.8" fill="#f4f3ee" />
      <rect x="8.6" y="15.4" width="6.8" height="1.6" rx="0.8" fill="#f4f3ee" />
    </Svg>
  );
}

export function HomeColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3.2L2.8 11h2.4v9h13.6v-9h2.4z" fill="#81b64c" />
      <path d="M5.2 11h13.6v9H5.2z" fill="#6d9c3f" />
      <rect x="9.6" y="13.6" width="4.8" height="6.4" rx="1" fill="#f4f3ee" />
    </Svg>
  );
}

export function BotColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="6" width="16" height="12" rx="3" fill="#64a8dc" />
      <rect x="6" y="8" width="12" height="7" rx="2" fill="#eaf3fb" />
      <circle cx="9.4" cy="11.5" r="1.2" fill="#2c3a4a" />
      <circle cx="14.6" cy="11.5" r="1.2" fill="#2c3a4a" />
      <rect x="10.5" y="3" width="3" height="3" rx="1" fill="#64a8dc" />
      <rect x="8" y="19" width="8" height="2" rx="1" fill="#3f6f97" />
    </Svg>
  );
}

export function LearnColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 4L2 8.5 12 13l10-4.5z" fill="#3d9ad9" />
      <path d="M6 11v4.2c0 1.5 2.7 2.8 6 2.8s6-1.3 6-2.8V11l-6 2.7z" fill="#2f77a8" />
      <rect x="19.4" y="9" width="1.6" height="6" rx="0.8" fill="#e8b93d" />
      <circle cx="20.2" cy="16" r="1.3" fill="#e8b93d" />
    </Svg>
  );
}

export function PuzzleColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M9 4h6v3.2a1.8 1.8 0 103.6 0H21v6h-3.2a1.8 1.8 0 100 3.6V20H4v-6h2.8a1.8 1.8 0 100-3.6H4V4z"
        fill="#e8862e"
      />
      <path d="M9 4h6v3.2a1.8 1.8 0 103.6 0H21v6h-3.2a1.8 1.8 0 100 3.6V20h-6z" fill="#f29b45" />
    </Svg>
  );
}

export function WatchColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2.5" y="5" width="19" height="14" rx="3.5" fill="#d64541" />
      <path d="M10 9l6 3-6 3z" fill="#ffffff" />
    </Svg>
  );
}

export function AnalyseColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="12" width="4" height="8" rx="1.2" fill="#81b64c" />
      <rect x="10" y="7" width="4" height="13" rx="1.2" fill="#64a8dc" />
      <rect x="17" y="3" width="4" height="17" rx="1.2" fill="#eeeed2" />
    </Svg>
  );
}

export function FriendsColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M2 12l5-4 5 3.5-2.3 1.8a2 2 0 01-2.4 0z" fill="#e8b48c" />
      <path d="M22 12l-5-4-5 3.5 2.3 1.8a2 2 0 002.4 0z" fill="#a2703f" />
      <rect x="1.5" y="10.2" width="4" height="5.6" rx="1.2" fill="#3d6b96" />
      <rect x="18.5" y="10.2" width="4" height="5.6" rx="1.2" fill="#2f7d4f" />
      <path d="M9 13.5l3 2.2 3-2.2 1.6 1.2-4.6 3.6-4.6-3.6z" fill="#d9a679" />
    </Svg>
  );
}

export function ProfileColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="8" r="4.2" fill="#e8b48c" />
      <path d="M4 20c.8-4.4 4-6.5 8-6.5s7.2 2.1 8 6.5z" fill="#3d6b96" />
      <path d="M8 5.5q4 -2.5 8 0l-.4 2a5 5 0 00-7.2 0z" fill="#4a3626" />
    </Svg>
  );
}

export function CoachColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="9" r="4.5" fill="#d9a679" />
      <path d="M4.5 20c.8-3.8 3.7-5.6 7.5-5.6s6.7 1.8 7.5 5.6z" fill="#7c4a34" />
      <path d="M6.5 9a5.5 5.5 0 0111 0h-1.8a3.7 3.7 0 00-7.4 0z" fill="#81b64c" />
      <rect x="15.7" y="8.2" width="2.4" height="3.6" rx="1.2" fill="#81b64c" />
      <path d="M17 11.8q0 2.4 -3 2.6" stroke="#81b64c" strokeWidth="1.4" fill="none" />
    </Svg>
  );
}

export function TimerColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="13.5" r="8" fill="#81b64c" />
      <circle cx="12" cy="13.5" r="5.6" fill="#f4f7ee" />
      <path d="M12 10v3.5l2.6 1.6" stroke="#2c3a1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <rect x="10" y="2" width="4" height="2.4" rx="1" fill="#5b8138" />
      <rect x="17.6" y="4.4" width="3" height="2" rx="1" transform="rotate(40 19 5.4)" fill="#5b8138" />
    </Svg>
  );
}

export function OnlineColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" fill="#3d9ad9" />
      <path
        d="M12 3a9 9 0 000 18M12 3a9 9 0 010 18M3.5 9.5h17M3.5 14.5h17M12 3q-4 4.5 0 18M12 3q4 4.5 0 18"
        stroke="#eaf3fb"
        strokeWidth="1.3"
        fill="none"
      />
    </Svg>
  );
}

export function HistoryColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" fill="#8a63c9" />
      <circle cx="12" cy="12" r="6.4" fill="#f0eafa" />
      <path d="M12 8.4V12l2.8 1.8" stroke="#4a3574" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function SettingsColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M12 2.8l1.2 2.6 2.8-.6 1 2.7 2.7 1-.6 2.8 2.1 1.9-2.1 1.9.6 2.8-2.7 1-1 2.7-2.8-.6L12 22l-1.2-2.6-2.8.6-1-2.7-2.7-1 .6-2.8L2.8 12l2.1-1.9-.6-2.8 2.7-1 1-2.7 2.8.6z"
        fill="#8f959d"
      />
      <circle cx="12" cy="12" r="3.4" fill="#43474d" />
    </Svg>
  );
}

export function TrophyColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 3h10v6a5 5 0 01-10 0z" fill="#e8b93d" />
      <path d="M7 4H3.8v2A4.2 4.2 0 008 9.6M17 4h3.2v2A4.2 4.2 0 0116 9.6" fill="none" stroke="#c69a2a" strokeWidth="1.8" />
      <rect x="10.8" y="13" width="2.4" height="4" fill="#c69a2a" />
      <rect x="8" y="17" width="8" height="2.6" rx="1" fill="#a87f22" />
    </Svg>
  );
}

export function FlameColor({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M12 2s6.5 5 6.5 11a6.5 6.5 0 01-13 0C5.5 9.5 8 7 9 5c.6 1.5 1.8 2.4 1.8 2.4S12 4.5 12 2z"
        fill="#e8542e"
      />
      <path d="M12 9s3.5 2.8 3.5 6a3.5 3.5 0 01-7 0c0-2 1.6-3.5 2.2-4.6.4.9 1.3 1.4 1.3 1.4z" fill="#f2a33a" />
    </Svg>
  );
}

// ---- Social glyphs (footer) ------------------------------------------------

export function XGlyph({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className} label="X (Twitter)">
      <path d="M4 3h4.5l4 5.5L17.5 3H21l-6.7 8L21.5 21H17l-4.4-6-5 6H4l7-8.5z" fill="currentColor" />
    </Svg>
  );
}

export function TikTokGlyph({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className} label="TikTok">
      <path
        d="M14 3h3c.2 2.2 1.6 3.8 4 4v3.1c-1.6 0-3-.5-4-1.3v6.7A5.5 5.5 0 1111 10v3.2a2.4 2.4 0 102 2.3z"
        fill="currentColor"
      />
    </Svg>
  );
}

export function YouTubeGlyph({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className} label="YouTube">
      <rect x="2" y="5.5" width="20" height="13" rx="3.5" fill="currentColor" />
      <path d="M10 9.5l5.5 2.5L10 14.5z" fill="var(--surface-1)" />
    </Svg>
  );
}

export function InstagramGlyph({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className} label="Instagram">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.4" fill="currentColor" />
    </Svg>
  );
}

export function DiscordGlyph({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className} label="Discord">
      <path
        d="M6 5.5A15 15 0 0110 4.5l.4 1a12 12 0 013.2 0l.4-1a15 15 0 014 1c1.8 2.8 2.5 5.8 2.2 9.2A12.6 12.6 0 0116.2 17l-.9-1.5q.8-.3 1.5-.8c-2.8 1.4-6.8 1.4-9.6 0q.7.5 1.5.8L7.8 17a12.6 12.6 0 01-4-2.3C3.4 11.3 4.2 8.3 6 5.5z"
        fill="currentColor"
      />
      <ellipse cx="9.3" cy="11.5" rx="1.3" ry="1.5" fill="var(--surface-1)" />
      <ellipse cx="14.7" cy="11.5" rx="1.3" ry="1.5" fill="var(--surface-1)" />
    </Svg>
  );
}
