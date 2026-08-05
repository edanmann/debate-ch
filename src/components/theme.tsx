"use client";

import { useEffect } from "react";
import { updateState, useAppState } from "@/lib/store";

export type ThemePref = "dark" | "light";

/** Applies the stored theme to <html data-theme>. */
export function ThemeSync() {
  const { theme } = useAppState();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  return null;
}

export function setTheme(theme: ThemePref) {
  updateState((s) => ({ ...s, theme }));
}
