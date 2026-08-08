"use client";

import { useEffect, useRef, useState } from "react";
import { UserFace } from "./user-face";

/**
 * Camera self-view for video debates. Falls back to the player's cartoon
 * avatar whenever the camera is off or unavailable, so the speaker panel is
 * never empty. Video is local-only — nothing is uploaded or recorded.
 */
export function SelfView({
  enabled,
  size = 96,
  speaking = false,
  name,
}: {
  enabled: boolean;
  size?: number;
  speaking?: boolean;
  name?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!enabled) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return;
    }
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [enabled]);

  if (!enabled || failed) {
    return <UserFace name={name} size={size} speaking={speaking} className="mx-auto" />;
  }

  return (
    <div
      className={`relative mx-auto overflow-hidden rounded-2xl bg-black ${
        speaking ? "ring-2 ring-brand" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        // Mirrored so it behaves like a mirror, as every video app does.
        className="h-full w-full -scale-x-100 object-cover"
      />
    </div>
  );
}
