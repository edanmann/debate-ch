"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppState } from "@/lib/store";

/** Signed-in users land on their dashboard, not the marketing page. */
export default function RedirectIfAuthed() {
  const { user } = useAppState();
  const router = useRouter();
  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);
  return null;
}
