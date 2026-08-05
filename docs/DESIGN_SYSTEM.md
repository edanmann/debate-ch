# Design System

Dark, premium, focused; friendly through colour and rounded geometry, not
clutter. Original throughout — no Chess.com/FIFA assets or trade dress.

## Tokens

Semantic tokens live on `:root` in `src/app/globals.css`; the Tailwind 4
`@theme inline` block maps them to utilities.

| Semantic token    | Value                    | Tailwind utility |
| ----------------- | ------------------------ | ---------------- |
| `--background`    | `#302e2b`                | `bg-background`  |
| `--surface-1`     | `#3a3733`                | `bg-surface-1`   |
| `--surface-2`     | `#423f3c`                | `bg-surface-2`   |
| `--surface-3`     | `#4a4744`                | `bg-surface-3`   |
| `--surface-hover` | `#5b5855`                | `bg-surface-hover` |
| `--border-subtle` | `rgba(255,255,255,0.09)` | `border-border-subtle` |
| `--text-primary`  | `#ffffff`                | `text-fg`        |
| `--text-secondary`| `#cfcfcf`                | `text-fg-muted`  |
| `--text-tertiary` | `#a8a5a1`                | `text-fg-faint`  |
| `--brand`         | `#81b64c`                | `bg-brand` etc.  |
| `--brand-hover`   | `#6fa13b`                | `bg-brand-hover` |
| `--brand-deep`    | `#769656`                | `bg-brand-deep`  |
| `--neutral-light` | `#eeeed2`                | `bg-cream`       |
| `--success`       | `#81b64c`                | `text-success`   |
| `--warning`       | `#e3a83d`                | `text-warning`   |
| `--danger`        | `#e0614f`                | `text-danger`    |
| `--info`          | `#64a8dc`                | `text-info`      |

Contrast: body text pairs (`#fff`/`#cfcfcf` on `#302e2b`–`#4a4744`) pass WCAG
AA. Brand green is used for large text, accents and fills with dark ink
(`#1e2313`) on top — not for body copy on dark.

## Typography

Inter (variable, `next/font`), system-ui fallback. Scale in practice:
display `text-4xl–6xl/black`, page title `text-3xl/extrabold`, section
`text-lg/bold`, card title `font-bold`, body `text-sm/base`, supporting
`text-xs text-fg-muted`, labels `text-[10-11px] uppercase tracking-wide`.
**All timers, ratings and stat numbers use `.numeric`** (tabular figures).

## Components (src/components)

- `ui.tsx` — Button (primary/secondary/ghost/danger × sm–xl), Card, Badge,
  ProgressBar (ARIA), EmptyState, SectionTitle
- `chrome.tsx` — adaptive navigation (guest header/footer; app rail; mobile
  bottom nav + "More" bottom sheet; chrome-free debate room)
- `avatar.tsx` — deterministic geometric bot emblems (see below)
- `stats.tsx` — six-stat bars (with opponent-comparison markers) and an
  original hexagonal radar
- `player-card.tsx` — tiered progression card (dark → bronze → silver → gold
  per spec thresholds), tabular OVR, reliability caption
- `icons.tsx` — original 24×24 stroke icon set

## Avatars

Bot art is a deterministic, original SVG emblem: palette pair + rotated
geometric form + initials, seeded by slug. Deliberate policy, not a shortcut:
real-person bots must never use likenesses (docs/SAFETY_AND_LEGAL.md).
Illustrated 2D characters can replace emblems behind the same component API.
Speaking state pulses via `.speaking-pulse`; `prefers-reduced-motion`
disables all animation globally.

## Responsive rules

Mobile-first. Desktop: persistent rail (≥lg). Mobile: top bar + 5-item bottom
nav + bottom sheets; safe-area inset padding on the nav; sticky timer header
in the debate room; panel tabs (stage/transcript/notes) instead of columns.

## Voice

Copy is confident and playful but honest: every mocked capability is labelled
in-place ("Demo mode", "Mock AI mode", "coming soon" on disabled store
badges). Empty states always name the next useful action.
