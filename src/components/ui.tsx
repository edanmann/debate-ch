import Link from "next/link";
import type { ReactNode } from "react";

/** Small shared UI primitives. Presentation only — no state. */

const buttonVariants = {
  // chess.com-style pressed edge: a solid darker bottom that collapses on press.
  primary:
    "bg-brand text-white font-bold shadow-[0_4px_0_var(--brand-edge)] hover:bg-brand-hover active:translate-y-[3px] active:shadow-[0_1px_0_var(--brand-edge)]",
  secondary:
    "bg-surface-3 text-fg font-semibold shadow-[0_4px_0_rgba(0,0,0,0.35)] hover:bg-surface-hover active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.35)]",
  ghost: "text-fg-muted hover:text-fg hover:bg-surface-2",
  danger: "bg-danger/15 text-danger font-medium hover:bg-danger/25",
} as const;

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-base rounded-xl",
  xl: "px-8 py-4 text-lg rounded-2xl",
} as const;

export function buttonClass(
  variant: keyof typeof buttonVariants = "primary",
  size: keyof typeof buttonSizes = "md"
): string {
  return `inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonVariants[variant]} ${buttonSizes[size]}`;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
}: {
  href: string;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonClass(variant, size)} ${className}`}>
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={`rounded-2xl border border-border-subtle bg-surface-1 ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "warning" | "danger" | "info";
  className?: string;
}) {
  const tones = {
    neutral: "bg-surface-3 text-fg-muted",
    brand: "bg-brand/15 text-brand",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
    info: "bg-info/15 text-info",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "brand",
  className = "",
}: {
  value: number; // 0..1
  tone?: "brand" | "warning" | "danger";
  className?: string;
}) {
  const tones = { brand: "bg-brand", warning: "bg-warning", danger: "bg-danger" };
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-surface-3 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${tones[tone]}`}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-subtle bg-surface-1/50 px-6 py-12 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="max-w-md text-sm text-fg-muted">{body}</p>
      {action}
    </div>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-lg font-bold tracking-tight ${className}`}>{children}</h2>
  );
}
