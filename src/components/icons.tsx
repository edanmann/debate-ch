/** Minimal original line-icon set (24×24, stroke-based). */

function base(path: React.ReactNode, label?: string) {
  return function Icon({ className = "h-5 w-5" }: { className?: string }) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden={label ? undefined : true}
        aria-label={label}
      >
        {path}
      </svg>
    );
  };
}

export const HomeIcon = base(
  <path d="M3 11l9-8 9 8M5 9.5V21h5v-6h4v6h5V9.5" />
);
export const DebateIcon = base(
  <>
    <path d="M3 5h10v7H8l-3 3v-3H3z" />
    <path d="M14 9h7v6h-2v3l-3-3h-2v-2" />
  </>
);
export const BotIcon = base(
  <>
    <rect x="5" y="8" width="14" height="10" rx="3" />
    <path d="M12 8V4M9 4h6" />
    <circle cx="9.5" cy="13" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="13" r="0.9" fill="currentColor" stroke="none" />
  </>
);
export const LearnIcon = base(
  <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5zM4 18V5.5M20 18H6.5" />
);
export const PuzzleIcon = base(
  <path d="M9 4h6v4a2 2 0 104 0h1v12H4V8h1a2 2 0 104 0z" />
);
export const WatchIcon = base(
  <>
    <rect x="3" y="5" width="18" height="13" rx="2" />
    <path d="M10 9.5l5 2.5-5 2.5zM8 21h8" />
  </>
);
export const AnalyseIcon = base(
  <path d="M4 20V10M10 20V4M16 20v-8M21 20H3" />
);
export const FriendsIcon = base(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20c.6-3.4 2.8-5 5.5-5s4.9 1.6 5.5 5" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M15.5 15.2c2.9-.3 4.6 1.3 5 4.3" />
  </>
);
export const ProfileIcon = base(
  <>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20.5c.8-4 3.5-6 7-6s6.2 2 7 6" />
  </>
);
export const SettingsIcon = base(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4L5.6 5.6" />
  </>
);
export const HistoryIcon = base(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3.5 2" />
  </>
);
export const TimerIcon = base(
  <>
    <circle cx="12" cy="13" r="7.5" />
    <path d="M12 9.5V13l2.5 1.5M9.5 3h5" />
  </>
);
export const MenuIcon = base(<path d="M4 7h16M4 12h16M4 17h16" />);
export const CloseIcon = base(<path d="M6 6l12 12M18 6L6 18" />);
export const CheckIcon = base(<path d="M4.5 12.5l5 5 10-11" />);
export const WarnIcon = base(
  <>
    <path d="M12 3L2.5 20h19z" />
    <path d="M12 9.5v5" />
    <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
  </>
);
export const MicIcon = base(
  <>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3M9 21h6" />
  </>
);
export const CoachIcon = base(
  <>
    <circle cx="12" cy="7" r="3" />
    <path d="M6 21v-3a6 6 0 0112 0v3M9 13.5L12 17l3-3.5" />
  </>
);
export const TrophyIcon = base(
  <>
    <path d="M7 4h10v5a5 5 0 01-10 0z" />
    <path d="M7 5H4v2a4 4 0 004 3M17 5h3v2a4 4 0 01-4 3M12 14v4M8.5 21h7M10 18h4" />
  </>
);
