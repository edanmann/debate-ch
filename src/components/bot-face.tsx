import { presentationFor } from "@/lib/bot-presentation";
import { CartoonAvatar } from "./cartoon-avatar";

/** Cartoon face for a bot by slug (falls back to the robot). */
export function BotFace({
  slug,
  name,
  size = 64,
  speaking = false,
  className = "",
}: {
  slug: string;
  name: string;
  size?: number;
  speaking?: boolean;
  className?: string;
}) {
  const p = presentationFor(slug);
  return (
    <CartoonAvatar
      config={p.avatar}
      name={name}
      size={size}
      speaking={speaking}
      className={className}
    />
  );
}

export function botFlag(slug: string): string | null {
  return presentationFor(slug).flag ?? null;
}
