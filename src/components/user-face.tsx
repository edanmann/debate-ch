"use client";

import { DEFAULT_USER_AVATAR } from "./avatar-builder";
import { CartoonAvatar } from "./cartoon-avatar";
import { useAppState } from "@/lib/store";

/** The signed-in player's cartoon avatar (falls back to the default look). */
export function UserFace({
  size = 64,
  speaking = false,
  className = "",
  name,
}: {
  size?: number;
  speaking?: boolean;
  className?: string;
  name?: string;
}) {
  const { user } = useAppState();
  return (
    <CartoonAvatar
      config={user?.avatar ?? DEFAULT_USER_AVATAR}
      name={name ?? user?.displayName ?? "You"}
      size={size}
      speaking={speaking}
      className={className}
    />
  );
}
